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
import {explain} from './lib/explain';

import {parseIfRunProcessArgs} from './util/args';
import {andHandle} from './util/helpers';

import {STRINGS} from './config';

const {EXITING_IF, STARTING_IF} = STRINGS;
const {DISCLAIMER_MESSAGE} = COMMON_STRINGS;

const impactEngine = async () => {
  const options = parseIfRunProcessArgs();
  const {
    inputPath,
    outputOptions,
    debug,
    observe,
    regroup,
    compute: computeFlag,
  } = options;

  debugLogger.overrideConsoleMethods(!!debug);

  logger.info(DISCLAIMER_MESSAGE);
  console.info(STARTING_IF);

  const {rawManifest} = await load(inputPath);
  const envManifest = await injectEnvironment(rawManifest);

  try {
    const {tree, ...context} = validateManifest(envManifest);
    const pluginStorage = await initialize(context);
    const computedTree = await compute(tree, {
      context,
      pluginStorage,
      observe,
      regroup,
      compute: computeFlag,
      timeSync: context['time-sync'],
    });

    if (context['time-sync']) {
      delete context.initialize.plugins['time-sync'];
    }

    if (context.aggregation) {
      storeAggregationMetrics({metrics: context.aggregation?.metrics});
    }

    const aggregatedTree = aggregate(computedTree, context.aggregation);
    envManifest.explainer && (context.explain = explain());

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
