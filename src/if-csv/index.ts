#!/usr/bin/env node
/* eslint-disable no-process-exit */
import * as YAML from 'js-yaml';

import {parseManifestFromStdin} from '../common/util/helpers';
import {validateManifest} from '../common/util/validations';
import {debugLogger} from '../common/util/debug-logger';
import {logger} from '../common/util/logger';
import {load} from '../common/lib/load';

import {injectEnvironment} from '../if-run/lib/environment';
import {initialize} from '../if-run/lib/initialize';
import {aggregate} from '../if-run/lib/aggregate';
import {compute} from '../if-run/lib/compute';

import {parseIfCsvArgs} from './util/args';
import {executeCsv} from './util/helpers';
import {CsvOptions} from './types/csv';

const IfCsv = async () => {
  // Call this function with false parameter to prevent log debug messages.
  debugLogger.overrideConsoleMethods(false);

  const pipedManifest = await parseManifestFromStdin();
  const {manifest, output, params} = await parseIfCsvArgs();
  const resolvedManifest = manifest || pipedManifest;
  let envManifest;

  if (resolvedManifest) {
    if (pipedManifest) {
      envManifest = await YAML.load(pipedManifest!);
    } else {
      const {rawManifest} = await load(resolvedManifest);
      envManifest = await injectEnvironment(rawManifest);
    }

    const {tree, ...context} = validateManifest(envManifest);
    const pluginStorage = await initialize(context.initialize.plugins);
    const computedTree = await compute(tree, {context, pluginStorage});
    const aggregatedTree = aggregate(computedTree, context.aggregation);
    const options: CsvOptions = {
      tree: aggregatedTree,
      context,
      outputPath: output,
      params,
    };
    const result = await executeCsv(options);

    if (!output && result) {
      console.log(result);
    }
  }

  process.exit(0);
};

IfCsv().catch(error => {
  if (error instanceof Error) {
    logger.error(error);
    process.exit(2);
  }
});
