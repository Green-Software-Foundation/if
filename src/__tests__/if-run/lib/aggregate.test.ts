/* eslint-disable @typescript-eslint/ban-ts-comment */

import {AggregationParams} from '../../../common/types/manifest';

import {
  aggregate,
  storeAggregationMetrics,
} from '../../../if-run/lib/aggregate';
import {AGGREGATION_METHODS} from '../../../if-run/types/aggregation';

describe('lib/aggregate: ', () => {
  beforeAll(() => {
    const metricStorage: AggregationParams = {
      metrics: ['carbon'],
      type: 'horizontal',
    };
    const convertedMetrics = metricStorage.metrics.map((metric: string) => ({
      [metric]: AGGREGATION_METHODS[2],
    }));

    storeAggregationMetrics(...convertedMetrics);
  });

  describe('aggregate(): ', () => {
    it('returns tree if aggregation is missing.', () => {
      const tree = {};
      const aggregation = undefined;

      const aggregatedTree = aggregate(tree, aggregation);
      expect(aggregatedTree).toEqual(tree);
    });

    it('returns tree if aggregation.type is missing.', () => {
      const tree = {};
      const aggregation = {
        metrics: [],
      };

      // @ts-ignore
      const aggregatedTree = aggregate(tree, aggregation);
      expect(aggregatedTree).toEqual(tree);
    });

    it('does horizontal aggregation.', () => {
      const tree = {
        children: {
          mocks: {
            outputs: [
              {
                timestamp: 'mock-timestamp',
                duration: 'mock-duration',
                carbon: 10,
              },
              {
                timestamp: 'mock-timestamp',
                duration: 'mock-duration',
                carbon: 10,
              },
            ],
          },
        },
      };

      const aggregatedTree = aggregate(tree, {
        metrics: ['carbon'],
        type: 'horizontal',
      });
      const expectedAggregated = {
        carbon:
          tree.children.mocks.outputs[0].carbon +
          tree.children.mocks.outputs[1].carbon,
      };
      expect(aggregatedTree.children.mocks.aggregated).toEqual(
        expectedAggregated
      );
    });

    it('does vertical aggregation.', () => {
      const tree = {
        children: {
          'mocks-1': {
            outputs: [
              {
                timestamp: 'mock-timestamp',
                duration: 'mock-duration',
                carbon: 10,
              },
              {
                timestamp: 'mock-timestamp',
                duration: 'mock-duration',
                carbon: 10,
              },
            ],
          },
          'mocks-2': {
            outputs: [
              {
                timestamp: 'mock-timestamp',
                duration: 'mock-duration',
                carbon: 20,
              },
              {
                timestamp: 'mock-timestamp',
                duration: 'mock-duration',
                carbon: 20,
              },
            ],
          },
        },
      };

      const aggregatedTree = aggregate(tree, {
        metrics: ['carbon'],
        type: 'vertical',
      });
      const expectedOutputs = [
        {
          carbon: 30,
          timestamp: 'mock-timestamp',
          duration: 'mock-duration',
        },
        {
          carbon: 30,
          timestamp: 'mock-timestamp',
          duration: 'mock-duration',
        },
      ];
      const expectedAggregated = {
        carbon:
          tree.children['mocks-1'].outputs[0].carbon +
          tree.children['mocks-2'].outputs[0].carbon +
          tree.children['mocks-1'].outputs[1].carbon +
          tree.children['mocks-2'].outputs[1].carbon,
      };
      expect(aggregatedTree.outputs).toEqual(expectedOutputs);
      expect(aggregatedTree.aggregated).toEqual(expectedAggregated);
    });

    it('does both aggregations.', () => {
      const tree = {
        children: {
          'mocks-1': {
            outputs: [
              {
                timestamp: 'mock-timestamp',
                duration: 'mock-duration',
                carbon: 10,
              },
              {
                timestamp: 'mock-timestamp',
                duration: 'mock-duration',
                carbon: 10,
              },
            ],
          },
          'mocks-2': {
            outputs: [
              {
                timestamp: 'mock-timestamp',
                duration: 'mock-duration',
                carbon: 20,
              },
              {
                timestamp: 'mock-timestamp',
                duration: 'mock-duration',
                carbon: 20,
              },
            ],
          },
        },
      };

      const aggregatedTree = aggregate(tree, {
        metrics: ['carbon'],
        type: 'both',
      });

      // horizontal aggregation
      const expectedNode1Horizontal = {
        carbon:
          tree.children['mocks-1'].outputs[0].carbon +
          tree.children['mocks-1'].outputs[1].carbon,
      };
      expect(aggregatedTree.children['mocks-1'].aggregated).toEqual(
        expectedNode1Horizontal
      );
      const expectedNode2Horizontal = {
        carbon:
          tree.children['mocks-2'].outputs[0].carbon +
          tree.children['mocks-2'].outputs[1].carbon,
      };
      expect(aggregatedTree.children['mocks-2'].aggregated).toEqual(
        expectedNode2Horizontal
      );

      // vertical aggregation
      const expectedOutputs = [
        {
          carbon: 30,
          timestamp: 'mock-timestamp',
          duration: 'mock-duration',
        },
        {
          carbon: 30,
          timestamp: 'mock-timestamp',
          duration: 'mock-duration',
        },
      ];
      expect(aggregatedTree.outputs).toEqual(expectedOutputs);
      const expectedAggregated = {
        carbon:
          tree.children['mocks-1'].outputs[0].carbon +
          tree.children['mocks-2'].outputs[0].carbon +
          tree.children['mocks-1'].outputs[1].carbon +
          tree.children['mocks-2'].outputs[1].carbon,
      };
      expect(aggregatedTree.aggregated).toEqual(expectedAggregated);
    });
  });
});
