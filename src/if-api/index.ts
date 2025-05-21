#!/usr/bin/env node
import {open} from 'fs/promises';
import type {AddressInfo} from 'net';

import express from 'express';
import type {NextFunction, Request, Response} from 'express';
import {dump, load} from 'js-yaml';
import {ERRORS} from '@grnsft/if-core/utils';

import type {Manifest} from '../common/types/manifest';
import {debugLogger} from '../common/util/debug-logger';
import {logger} from '../common/util/logger';
import {executeWithContext} from '../common/util/storage';
import {validateManifest} from '../common/util/validations';

import {aggregate} from '../if-run/lib/aggregate';
import {getExecution} from '../if-run/lib/environment';
import {
  initialize,
  setExternalPluginWarning,
  setDisabledPlugins,
} from '../if-run/lib/initialize';
import {compute} from '../if-run/lib/compute';
import {explain} from '../if-run/lib/explain';

import {STRINGS} from './config';
import {parseIfApiProcessArgs} from './util/args';

const {
  DISCLAIMER_MESSAGE,
  INTERNAL_SERVER_ERROR,
  INVALID_DISABLED_PLUGINS,
  INVALID_JSON,
  INVALID_YAML,
  MISSING_MANIFEST,
  PROCESSING_REQUEST,
  SERVER_STARTED,
  SERVER_START_FAILED,
  UNSUPPORTED_CONTENT_TYPE,
} = STRINGS;

const CT_YAML = 'application/yaml';
const CT_JSON = 'application/json';
const CT_VALID = [CT_YAML, CT_JSON];

const ERROR_LIST: readonly ErrorConstructor[] = Object.values(ERRORS);

/**
 * Determine response type.
 */
const determineResponseType = (req: express.Request) => {
  const acceptHeader = req.get('Accept');
  if (acceptHeader && acceptHeader !== '*/*') {
    // Determine based on request Accept header
    const responseType = req.accepts(CT_VALID);
    if (responseType) {
      return responseType;
    }
  }

  // Determine based on request Content-Type
  return req.get('Content-Type');
};

/**
 * Send the response in the appropriate format.
 */
const sendResponse = (
  req: Request,
  res: Response,
  manifest: Manifest,
  status: number
) => {
  const responseType = determineResponseType(req);
  if (responseType === CT_YAML) {
    const yamlData = dump(manifest, {noRefs: true});
    res.set('Content-Type', responseType);
    res.status(status).send(yamlData);
  } else {
    res.set('Content-Type', responseType);
    res.status(status).json(manifest);
  }
};

/**
 * Parse disabled plugins file
 * @param filename Filename that contains plugin names to be disabled
 * @returns Set of disabledPlugins
 */
const parseDisabledPlugins = async (filename: string | undefined) => {
  // If no filename is specified, disable builtin:Shell, builtin:CSVImport, builtin:CSVLookup by default.
  if (!filename) {
    return new Set<string>([
      'builtin:Shell',
      'builtin:CSVImport',
      'builtin:CSVLookup',
    ]);
  }

  const disabledPlugins = new Set<string>();
  const file = await open(filename);
  try {
    for await (const line of file.readLines()) {
      const words = line.split(/ *: */);
      switch (words.length) {
        case 1:
          disabledPlugins.add(`builtin:${words[0]}`);
          break;
        case 2:
          disabledPlugins.add(`${words[0]}:${words[1]}`);
          break;
        default:
          throw new Error(INVALID_DISABLED_PLUGINS(line));
      }
    }
  } finally {
    await file.close();
  }
  return disabledPlugins;
};

const formatAddr = (addr: string | AddressInfo | null): string => {
  if (typeof addr === 'string') {
    return addr;
  } else if (addr === null) {
    return 'unknown';
  } else if (addr.family === 'IPv6') {
    return `[${addr.address}]:${addr.port}`;
  } else {
    return `${addr.address}:${addr.port}`;
  }
};

/**
 * Start the API server.
 */
const startServer = async () => {
  const options = parseIfApiProcessArgs();

  debugLogger.overrideConsoleMethods(options.debug);

  logger.info(DISCLAIMER_MESSAGE);

  setExternalPluginWarning(!options.disableExternalPluginWarning);

  const disabledPlugins = await parseDisabledPlugins(options.disabledPlugins);
  setDisabledPlugins(disabledPlugins);

  // Get execution information (command, environment).
  const execution = await getExecution();

  const app = express();

  // Middleware for JSON requests
  app.use(express.json({type: CT_JSON}));

  // Custom middleware for YAML requests
  app.use(
    express.text({type: CT_YAML}),
    (req: Request, res: Response, next: NextFunction): void => {
      if (req.is(CT_YAML)) {
        try {
          req.body = load(req.body);
        } catch (err: any) {
          res.status(400).json({
            error: INVALID_YAML,
            detail: err.message,
          });
          return;
        }
      }
      next();
    }
  );

  // Add request context storage
  app.use((_req: Request, _res: Response, next: NextFunction): void =>
    executeWithContext(next)
  );

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response): void => {
    res.status(200).send('OK');
  });

  // Process manifest endpoint
  app.post('/v1/run', async (req: Request, res: Response): Promise<void> => {
    logger.info(PROCESSING_REQUEST);

    // Check if request body exists
    if (!req.body) {
      res.status(400).json({error: MISSING_MANIFEST});
      return;
    }

    // Check request Content-Type
    if (!req.is(CT_VALID)) {
      res.status(415).json({error: UNSUPPORTED_CONTENT_TYPE});
      return;
    }

    // Create manifest with execution information
    const envManifest: Manifest = {
      ...req.body,
      execution: {
        command: execution.command,
        environment: {
          ...execution.environment,
          'date-time': `${new Date().toISOString()} (UTC)`,
        },
        status: execution.status,
      },
    };

    try {
      const {tree, ...context} = validateManifest(envManifest);

      const pluginStorage = await initialize(context);

      const computedTree = await compute(tree, {
        context,
        pluginStorage,
        observe: req.query.observe === 'true',
        regroup: req.query.regroup === 'true',
        compute: req.query.compute === 'true',
        append: false,
      });

      const aggregatedTree = aggregate(computedTree, context.aggregation);

      envManifest.explainer && (context.explain = explain());

      // Prepare response data
      const responseData = {tree: aggregatedTree, ...context};

      // Return response in the determined format
      sendResponse(req, res, responseData, 200);
    } catch (err) {
      // If it's one of the errors in ERRORS, terminate with status code 400
      if (ERROR_LIST.some(val => err instanceof val)) {
        /** Execution block exists because manifest is already processed. Set's status to `fail`. */
        envManifest.execution!.status = 'fail';
        envManifest.execution!.error = (err as Error).toString();

        // Return response in the determined format
        sendResponse(req, res, envManifest, 400);
        return;
      }

      // Set Content-Type to application/json
      res.set('Content-Type', CT_JSON);
      // For all other cases, terminate with status code 500
      if (err instanceof Error) {
        res.status(500).json({
          error: INTERNAL_SERVER_ERROR,
          detail: err.message,
        });
        return;
      }
      res.status(500).json({error: INTERNAL_SERVER_ERROR});
    }
  });

  // Set up custom error handler
  app.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (err: any, _req: Request, res: Response, _next: NextFunction): void => {
      // Set Content-Type to application/json
      res.set('Content-Type', CT_JSON);

      // If SyntaxError (JSON parse error), terminate with status code 400
      if (err.status === 400 && err instanceof SyntaxError && 'body' in err) {
        res.status(400).json({
          error: INVALID_JSON,
          detail: err.message,
        });
      } else if (err instanceof Error) {
        if ('status' in err) {
          res.status(err.status as number).json({
            error: err.message,
          });
        } else {
          res.status(500).json({
            error: INTERNAL_SERVER_ERROR,
            detail: err.message,
          });
        }
      } else {
        res.status(500).json({
          error: INTERNAL_SERVER_ERROR,
        });
      }
    }
  );

  // Start the server
  const {port, host} = options;
  const server = app.listen(port, host, (err?: Error) => {
    if (err) {
      logger.error(SERVER_START_FAILED(err));
      // eslint-disable-next-line no-process-exit
      process.exit(2);
    }
    logger.info(SERVER_STARTED(formatAddr(server.address())));
  });

  // Handle Signal
  const handler = (err: NodeJS.Signals) => {
    logger.debug(`${err} signal received: closing HTTP server`);
    server.close(() => {
      logger.debug('HTTP server closed');
    });
  };
  process.once('SIGTERM', handler);
  process.once('SIGINT', handler);
};

// Start the server
startServer().catch(err => {
  logger.error(SERVER_START_FAILED(err));
  // eslint-disable-next-line no-process-exit
  process.exit(2);
});
