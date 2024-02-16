import {AggregatorOperations, aggregator} from '../util/aggregation-storage';

import {AggregationParams} from '../types/manifest';
import {getAggregationMethod} from '../util/param-selectors';

/**
 *
 */
const verticallyAggregate = (
  node: any,
  storage: AggregatorOperations,
  parentNode = node
) => {
  if (node.children) {
    for (const child in node.children) {
      verticallyAggregate(node.children[child], storage, node);
    }
  }

  if (node.inputs) {
    storage.set(node.outputs);
  }

  parentNode.aggregated = storage.get();
};

const horizontallyAggregate = (node: any) => {
  if (node.children) {
    for (const child in node.children) {
      horizontallyAggregate(node.children[child]);
    }
  }
  const metric = 'energy';

  if (node.outputs) {
    node[`total-${metric}`] = node.outputs.reduce((acc: any, output: any) => {
      return acc + output[`${metric}`];
    }, 0);
  }
};

/**
 * If aggregation is disabled, then returns given `tree`.
 * Otherwise creates copy of the tree, then applies aggregation to it.
 */
export const aggregate = (tree: any, aggregationParams?: AggregationParams) => {
  if (!aggregationParams || !aggregationParams.type) {
    return tree;
  }

  const {metrics, type} = aggregationParams;

  const copyOfTree = structuredClone(tree);
  const storage = aggregator(metrics);

  if (type === 'vertical') {
    verticallyAggregate(copyOfTree, storage);

    return copyOfTree;
  }

  if (type === 'horizontal') {
    horizontallyAggregate(copyOfTree);
    return copyOfTree;
  }

  return copyOfTree;
};
