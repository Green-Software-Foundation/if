#!/usr/bin/env node
import {aggregate} from './lib/aggregate';
import {compute} from './lib/compute';
import {injectEnvironment} from './lib/environment';
import {exhaust} from './lib/exhaust';
import {initialize} from './lib/initialize';
import {load} from './lib/load';
import {parameterize} from './lib/parameterize';

import {parseArgs} from './util/args';
import {andHandle} from './util/helpers';
import {logger} from './util/logger';
import {validateManifest} from './util/validations';

import {STRINGS} from './config';

const {DISCLAIMER_MESSAGE} = STRINGS;

const impactEngine = async () => {
  const options = parseArgs();

  if (!options) {
    return;
  }

  logger.info(DISCLAIMER_MESSAGE);
  const {inputPath, paramPath, outputOptions} = options;

  const {rawManifest, parameters} = await load(inputPath!, paramPath);
  const envManifest = await injectEnvironment(rawManifest);

  try {
    const {tree, ...context} = validateManifest(envManifest);
    parameterize.combine(context.params, parameters);
    const pluginStorage = await initialize(context.initialize.plugins);
    const computedTree = await compute(tree, {context, pluginStorage});
    const aggregatedTree = aggregate(computedTree, context.aggregation);
    exhaust(aggregatedTree, context, outputOptions);
  } catch (error) {
    if (error instanceof Error) {
      envManifest.execution.status = 'fail';
      envManifest.execution.error = error.toString();
      logger.error(error);
      const {tree, ...context} = envManifest;
      exhaust(tree, context, outputOptions);
    }
  }
};

impactEngine().catch(andHandle);
