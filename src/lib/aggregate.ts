import {AggregatorOperations, aggregator} from '../util/aggregation-storage';
import {PARAMETERS} from '../config';
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

/**
 * sum or average values in a time series to give a single
 * representative value for the observation period
 */
const horizontallyAggregate = (node: any, metrics: string[]) => {
  if (node.children) {
    for (const child in node.children) {
      horizontallyAggregate(node.children[child], metrics);
    }
  }

  if (node.outputs) {
    for (let i = 0; i < metrics.length; i++) {
      const metric = metrics[i];
      const method = getAggregationMethod(metric, PARAMETERS);

      if (method === 'sum') {
        node[`total-${metric}`] = node.outputs.reduce(
          (acc: any, output: any) => {
            return acc + output[`${metric}`];
          },
          0
        );
      } else {
        const sum = node.outputs.reduce((acc: any, output: any) => {
          return acc + output[`${metric}`];
        }, 0);
        node[`average-${metric}`] = sum / node.outputs.length;
      }
    }
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
    horizontallyAggregate(copyOfTree, metrics);
    return copyOfTree;
  }

  return copyOfTree;
};
