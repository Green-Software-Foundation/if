import {ERRORS} from '../util/errors';
import {getAggregationMethod} from '../util/param-selectors';
import {PARAMETERS} from '../config';
import {STRINGS} from '../config';

import {ManifestCommon} from '../types/manifest';
import {Node} from '../types/compute';
const {InvalidAggregationParams} = ERRORS;
const {INVALID_AGGREGATION_METHOD} = STRINGS;

/**
 * Validates metrics array before applying aggregator.
 * If aggregation method is `none`, then throws error.
 */
const checkIfMetricsAreValid = (context: ManifestCommon) => {
  context.aggregation?.metrics.forEach(metric => {
    const method = getAggregationMethod(metric, PARAMETERS);
    if (method === 'none') {
      throw new InvalidAggregationParams(INVALID_AGGREGATION_METHOD(method));
    }
  });
};

/**Returns Boolean indicating whether a node has children */
function hasChildren(node: Node) {
  if (node['children']) {
    return true;
  }
  return false;
}

/** Returns children of given node */
function getChildren(node: Node): Node[] {
  const children: Node[] = [];
  Object.keys(node.children).forEach(child => {
    children.push(node.children[child]);
  });
  return children;
}

/** element-wise addition of two arrays */
function aggregateArrays(a: Array<any>, b: Array<any>, method: string) {
  if (method === 'sum') {
    return a.map((element, idx) => {
      return element + b[idx];
    });
  } else if (method === 'avg') {
    return a.map((element, idx) => {
      return (element + b[idx]) / 2;
    });
  }
  return a;
}

/** aggregates multiple time series into one single time series*/
export const aggregate = (tree: Node, context: ManifestCommon) => {
  checkIfMetricsAreValid(context);
  // check if root has children
  if (hasChildren(tree)) {
    // iterate through child nodes
    getChildren(tree).forEach(node => {
      // if the child has children, start recursive call to aggregate()
      if (hasChildren(node)) {
        aggregate(node, context);
      }
      context.aggregation?.metrics.forEach(metric => {
        let treeTimeSeries = tree.inputs?.map(input => input[`${metric}`]);

        if (
          treeTimeSeries === undefined ||
          treeTimeSeries?.includes(undefined)
        ) {
          treeTimeSeries = new Array(3).fill(0);
        }

        let nodeTimeSeries = node.inputs?.map(input => input[`${metric}`]);

        if (
          nodeTimeSeries === undefined ||
          nodeTimeSeries?.includes(undefined)
        ) {
          nodeTimeSeries = new Array(3).fill(0);
        }

        if (
          context.aggregation?.type === 'both' ||
          context.aggregation?.type === 'vertical'
        ) {
          if (tree[`aggregated-${metric}`]) {
            if (node[`aggregated-${metric}`]) {
              tree[`aggregated-${metric}`] = aggregateArrays(
                tree[`aggregated-${metric}`],
                node[`aggregated-${metric}`],
                getAggregationMethod(metric, PARAMETERS)
              );
            } else {
              tree[`aggregated-${metric}`] = aggregateArrays(
                tree[`aggregated-${metric}`],
                nodeTimeSeries,
                getAggregationMethod(metric, PARAMETERS)
              );
            }
          } else {
            if (node[`aggregated-${metric}`]) {
              tree[`aggregated-${metric}`] = aggregateArrays(
                treeTimeSeries,
                node[`aggregated-${metric}`],
                getAggregationMethod(metric, PARAMETERS)
              );
            } else {
              tree[`aggregated-${metric}`] = aggregateArrays(
                treeTimeSeries,
                nodeTimeSeries,
                getAggregationMethod(metric, PARAMETERS)
              );
            }
          }
        }

        if (
          context.aggregation?.type === 'both' ||
          context.aggregation?.type === 'horizontal'
        ) {
          // now do horizontal aggregation
          tree[`total-${metric}`] = treeTimeSeries.reduce((a, b) => a + b, 0);
          node[`total-${metric}`] = nodeTimeSeries.reduce((a, b) => a + b, 0);

          if (tree[`aggregated-${metric}`]) {
            tree[`total-aggregated-${metric}`] = tree[
              `aggregated-${metric}`
            ].reduce((a: number, b: number) => a + b, 0);
          }
          if (node[`aggregated-${metric}`]) {
            node[`total-aggregated-${metric}`] = node[
              `aggregated-${metric}`
            ].reduce((a: number, b: number) => a + b, 0);
          }
        }
      });
    });
  }

  return tree;
};
