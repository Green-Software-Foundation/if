import {logger} from './util/logger';
import {load} from './lib/load';
import {parameterize} from './lib/parameterize';
import {initalize} from './lib/initialize';
import {compute} from './lib/compute';
import {aggregate} from './lib/aggregate';
import {exhaust} from './lib/exhaust';
import {STRINGS} from './config';
import {validateOptions} from './util/args';

const {DISCLAIMER_MESSAGE} = STRINGS;

export const run = async (
  manifest: string,
  output: string | undefined,
  overrideParams: string | undefined
) => {
  logger.info(DISCLAIMER_MESSAGE);
  const {inputPath, outputPath, paramPath} = validateOptions(
    manifest,
    output,
    overrideParams
  );

  const {tree, context, parameters} = await load(inputPath, paramPath);
  parameterize.combine(context.params, parameters);
  const plugins = await initalize(context.initialize.plugins);
  const computedTree = await compute(tree, {context, plugins});
  const aggregatedTree = aggregate(computedTree, context.aggregation);
  exhaust(aggregatedTree, context, outputPath);

  return;
};
