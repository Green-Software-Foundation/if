import {AGGREGATION_METHODS} from '@grnsft/if-core/consts';
import {PluginParams} from '@grnsft/if-core/types';

import {debugLogger} from '../../common/util/debug-logger';
import {logger} from '../../common/util/logger';
import {getStorage} from '../../common/util/storage';
import {
  AggregationParams,
  AggregationParamsSure,
  AggregationMetricsWithMethod,
} from '../../common/types/manifest';

import {aggregateOutputsIntoOne} from '../util/aggregation-helper';
import {memoizedLog} from '../util/log-memoize';

import {STRINGS} from '../config/strings';

const {
  AGGREGATING_NODE,
  AGGREGATING_OUTPUTS,
  UNKNOWN_PARAM,
  CHECKING_AGGREGATION_METHOD,
} = STRINGS;

/**
 * Gets `i`th element from all children outputs and collects them in single array.
 */
const getIthElementsFromChildren = (children: any, i: number) => {
  const values = Object.values(children);

  return values.map((value: any) => {
    const output = value.outputs;

    return output[i];
  });
};

/**
 * 1. Gets the i'th element from each childrens outputs (treating children as rows and we are after a column of data).
 * 2. Now we just aggregate over the `ithSliceOfOutputs` the same as we did for the normal outputs.
 */
const temporalAggregation = (node: any, metrics: string[]) => {
  const outputs: PluginParams[] = [];
  const values: any = Object.values(node.children);

  for (let i = 0; i < values[0].outputs.length; i++) {
    const ithSliceOfOutputs = getIthElementsFromChildren(node.children, i);
    outputs.push(aggregateOutputsIntoOne(ithSliceOfOutputs, metrics, true));
  }

  return outputs;
};

/**
 * Navigates the tree depth first, bottom up,
 *  left to right aggregating the component nodes and then the grouping nodes will be aggregated
 *  only when all their child nodes have been aggregated.
 * 1. Aggregates all the children.
 * 2. At this point you can be positive all your children have been aggregated and so you can now work on aggregating yourself.
 * 3. It's component node, аggregates just the outputs of THIS component node (horizontal/component aggregation).
 * 4. Else it's grouping node, first does temporal aggregation. This assumes everything is on the same time-grid.
 *    The outputs of the grouping node are the aggregated time bucketed outputs of it's children.
 * 5. Now a grouping node has it's own outputs, it can horizotnally aggregate them.
 */
const aggregateNode = (node: any, aggregationParams: AggregationParamsSure) => {
  const metrics = aggregationParams!.metrics;
  const type = aggregationParams!.type;

  if (node.children) {
    for (const child in node.children) {
      console.debug(AGGREGATING_NODE(child));

      aggregateNode(node.children[child], aggregationParams);
    }
  }

  if (!node.children) {
    /** `time` aggregation is the new name of `horizontal`. */
    if (type === 'horizontal' || type === 'time' || type === 'both') {
      node.aggregated = aggregateOutputsIntoOne(node.outputs, metrics);
    }
  } else {
    /** `component` aggregation is the new name of `vertical`. */
    if (type === 'vertical' || type === 'component' || type === 'both') {
      const outputs = temporalAggregation(node, metrics);
      node.outputs = outputs;
      node.aggregated = aggregateOutputsIntoOne(outputs, metrics);
    }
  }
};

/**
 * If aggregation is disabled, then returns given `tree`.
 * Otherwise creates copy of the tree, then applies aggregation to it.
 */
export const aggregate = (tree: any, aggregationParams: AggregationParams) => {
  console.debug(AGGREGATING_OUTPUTS);

  if (!aggregationParams || !aggregationParams.type) {
    return tree;
  }

  const copyOfTree = structuredClone(tree);
  aggregateNode(copyOfTree, aggregationParams);

  return copyOfTree;
};

/**
 * Gets or stores aggregation metrics.
 */
export const storeAggregationMetrics = (
  aggregationMetrics?: AggregationMetricsWithMethod
) => {
  if (aggregationMetrics) {
    getStorage().metrics = {
      ...getStorage().metrics,
      ...aggregationMetrics,
    };
  }

  return getStorage().metrics;
};

/**
 * Returns aggregation method for given `metric`.
 */
export const getAggregationInfoFor = (metric: string) => {
  debugLogger.setExecutingPluginName();
  memoizedLog(console.debug, '\n');
  memoizedLog(console.debug, CHECKING_AGGREGATION_METHOD(metric));
  const aggregationMetricsStorage = storeAggregationMetrics();

  if (
    aggregationMetricsStorage &&
    Object.keys(aggregationMetricsStorage).includes(metric)
  ) {
    return aggregationMetricsStorage[metric];
  }

  memoizedLog(logger.warn, UNKNOWN_PARAM(metric));

  return {
    time: AGGREGATION_METHODS[3],
    component: AGGREGATION_METHODS[3],
  };
};
