#!/usr/bin/env node
import {aggregate} from './lib/aggregate';
import {compute} from './lib/compute';
import {exhaust} from './lib/exhaust';
import {initalize} from './lib/initialize';
import {load} from './lib/load';
import {parameterize} from './lib/parameterize';

import {parseArgs} from './util/args';
import {andHandle} from './util/helpers';
import {logger} from './util/logger';

import {STRINGS} from './config';

const packageJson = require('../package.json');

const {DISCLAIMER_MESSAGE} = STRINGS;

const impactEngine = async () => {
  logger.info(DISCLAIMER_MESSAGE);
  const options = parseArgs();

  if (Object.keys(options).length === 0) {
    return;
  }

  const {inputPath, outputPath, paramPath} = options;

  const {tree, context, parameters} = await load(inputPath!, paramPath);
  parameterize.combine(context.params, parameters);
  const pluginStorage = await initalize(context.initialize.plugins);
  const computedTree = await compute(tree, {context, pluginStorage});
  const aggregatedTree = aggregate(computedTree, context.aggregation);
  context['if-version'] = packageJson.version;
  exhaust(aggregatedTree, context, outputPath);

  return;
};

impactEngine().catch(andHandle);
