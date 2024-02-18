#!/usr/bin/env node
import {parseArgs} from './util/args';
import {ERRORS} from './util/errors';
import {andHandle} from './util/helpers';
import {logger} from './util/logger';
import {saveYamlFileAs} from './util/yaml';

import {STRINGS} from './config';

import {initalize} from './lib/initialize';
import {compute} from './lib/compute';
import {load} from './lib/load';
import {aggregate} from './lib/aggregate';
import {exhaust} from './lib/exhaust';

const {CliInputError} = ERRORS;

const {DISCLAIMER_MESSAGE, SOMETHING_WRONG} = STRINGS;

const impactEngine = async () => {
  logger.info(DISCLAIMER_MESSAGE);
  const options = parseArgs();

  if (options) {
    const {inputPath, outputPath} = options;

    const {tree, context} = await load(inputPath);
    const plugins = await initalize(context.initialize.plugins);
    const computedTree = await compute(tree, context, plugins);
    const aggregatedTree = aggregate(computedTree, context.aggregation);
    exhaust(context, aggregatedTree);

    const outputFile = {
      ...context,
      tree: aggregatedTree,
    };

    if (!outputPath) {
      logger.info(JSON.stringify(outputFile, null, 2));
      return;
    }

    await saveYamlFileAs(computedTree, outputPath);

    return;
  }

  return Promise.reject(new CliInputError(SOMETHING_WRONG));
};

impactEngine().catch(andHandle);
