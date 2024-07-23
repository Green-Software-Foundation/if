#!/usr/bin/env node
import {STRINGS as COMMON_STRINGS} from '../common/config';
import {validateManifest} from '../common/util/validations';
import {debugLogger} from '../common/util/debug-logger';
import {logger} from '../common/util/logger';
import {load} from '../common/lib/load';

import {aggregate, storeAggregationMetrics} from './lib/aggregate';
import {injectEnvironment} from './lib/environment';
import {initialize} from './lib/initialize';
import {compute} from './lib/compute';
import {exhaust} from './lib/exhaust';

import {parseIfRunProcessArgs} from './util/args';
import {andHandle, storeAggregationMethods} from './util/helpers';

import {STRINGS} from './config';

const {EXITING_IF, STARTING_IF} = STRINGS;
const {DISCLAIMER_MESSAGE} = COMMON_STRINGS;

const impactEngine = async () => {
  const options = parseIfRunProcessArgs();
  const {inputPath, outputOptions, debug} = options;

  debugLogger.overrideConsoleMethods(!!debug);

  logger.info(DISCLAIMER_MESSAGE);
  console.info(STARTING_IF);

  const {rawManifest} = await load(inputPath);
  const envManifest = await injectEnvironment(rawManifest);

  try {
    const {tree, ...context} = validateManifest(envManifest);
    const pluginStorage = await initialize(context.initialize.plugins);

    if (context.aggregation) {
      storeAggregationMetrics({metrics: context.aggregation?.metrics});
    }

    storeAggregationMethods(context.initialize.plugins, pluginStorage);

    const computedTree = await compute(tree, {context, pluginStorage});
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
