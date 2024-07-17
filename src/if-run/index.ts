#!/usr/bin/env node
import {aggregate} from './lib/aggregate';
import {compute} from './lib/compute';
import {injectEnvironment} from './lib/environment';
import {exhaust} from './lib/exhaust';
import {initialize} from './lib/initialize';
import {parameterize} from './lib/parameterize';
import {load} from '../common/lib/load';

import {parseIfRunProcessArgs} from './util/args';
import {andHandle} from './util/helpers';
import {logger} from '../common/util/logger';
import {validateManifest} from '../common/util/validations';
import {debugLogger} from '../common/util/debug-logger';

import {STRINGS} from './config';
import {STRINGS as COMMON_STRINGS} from '../common/config';

const {EXITING_IF, STARTING_IF} = STRINGS;
const {DISCLAIMER_MESSAGE} = COMMON_STRINGS;

const impactEngine = async () => {
  const options = parseIfRunProcessArgs();
  const {
    inputPath,
    paramPath,
    outputOptions,
    debug,
    observe,
    regroup,
    compute: computeFlag,
  } = options;

  debugLogger.overrideConsoleMethods(!!debug);

  logger.info(DISCLAIMER_MESSAGE);
  console.info(STARTING_IF);

  const {rawManifest, parameters} = await load(inputPath, paramPath);
  const envManifest = await injectEnvironment(rawManifest);

  try {
    const {tree, ...context} = validateManifest(envManifest);
    parameterize.combine(context.params, parameters);
    const pluginStorage = await initialize(context.initialize.plugins);
    const computedTree = await compute(tree, {
      context,
      pluginStorage,
      observe,
      regroup,
      compute: computeFlag,
    });
    const aggregatedTree = aggregate(computedTree, context.aggregation);
    await exhaust(aggregatedTree, context, outputOptions);
  } catch (error) {
    if (error instanceof Error) {
      envManifest.execution!.status = 'fail';
      envManifest.execution!.error = error.toString();
      logger.error(error);
      const {tree, ...context} = envManifest;

      if (error.name !== 'ExhaustError') {
        exhaust(tree, context, outputOptions);
      }
    }
  }
  console.info(EXITING_IF);
};

impactEngine().catch(andHandle);
