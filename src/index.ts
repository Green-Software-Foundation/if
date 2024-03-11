#!/usr/bin/env node
import {aggregate} from './lib/aggregate';
import {compute} from './lib/compute';
import {exhaust} from './lib/exhaust';
import {
  initalizeExhaustPlugins,
  initalizePipelinePlugins,
} from './lib/initialize';
import {load} from './lib/load';
import {parameterize} from './lib/parameterize';

import {parseArgs} from './util/args';
import {ERRORS} from './util/errors';
import {andHandle} from './util/helpers';
import {logger} from './util/logger';

import {STRINGS} from './config';

const packageJson = require('../package.json');

const {CliInputError} = ERRORS;

const {DISCLAIMER_MESSAGE, SOMETHING_WRONG} = STRINGS;

const impactEngine = async () => {
  logger.info(DISCLAIMER_MESSAGE);
  const options = parseArgs();

  if (options) {
    const {inputPath, outputPath, paramPath} = options;

    const {tree, context, parameters} = await load(inputPath, paramPath);
    parameterize.combine(context.params, parameters);
    const pipelinePluginsStorage = await initalizePipelinePlugins(
      context.initialize.plugins
    );
    const exhaustPlugins = await initalizeExhaustPlugins(
      context.initialize.exhaustPlugins
    );
    const computedTree = await compute(tree, {
      context,
      plugins: pipelinePluginsStorage,
    });
    const aggregatedTree = aggregate(computedTree, context.aggregation);
    context['if-version'] = packageJson.version;
    exhaust(aggregatedTree, exhaustPlugins, context, outputPath);

    return;
  }

  return Promise.reject(new CliInputError(SOMETHING_WRONG));
};

impactEngine().catch(andHandle);
