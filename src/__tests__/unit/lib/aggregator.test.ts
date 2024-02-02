import {aggregate} from '../../../lib/aggregator';

import {STRINGS, PARAMETERS} from '../../../config';

import {ERRORS} from '../../../util/errors';

const {INVALID_AGGREGATION_METHOD, METRIC_MISSING} = STRINGS;

const {InvalidAggregationParams} = ERRORS;

describe('lib/aggregator: ', () => {
  describe('aggregate(): ', () => {
    it('throws error if aggregation method is none.', () => {
      const inputs = [{}];
      const metrics = ['total-resources'];

      const expectedMessage = INVALID_AGGREGATION_METHOD('none');

      expect.assertions(1);

      try {
        aggregate(inputs, metrics, PARAMETERS);
      } catch (error) {
        expect(error).toEqual(new InvalidAggregationParams(expectedMessage));
      }
    });

    it('throws error if metric is not found while aggregation.', () => {
      const inputs = [
        {
          'ram-util': 10,
        },
      ];
      const metrics = ['cpu-util'];

      const expectedMessage = METRIC_MISSING(metrics[0], 0);

      expect.assertions(1);

      try {
        aggregate(inputs, metrics, PARAMETERS);
      } catch (error) {
        expect(error).toEqual(new InvalidAggregationParams(expectedMessage));
      }
    });

    it('should successfully calculate avg.', () => {
      const inputs = [
        {
          'cpu-util': 10,
        },
        {
          'cpu-util': 20,
        },
      ];
      const metrics = ['cpu-util'];

      const expectedKey = `aggregated-${Object.keys(inputs[0])[0]}`;
      const expectedValue = (inputs[0]['cpu-util'] + inputs[1]['cpu-util']) / 2;
      const expectedResult = {
        [`${expectedKey}`]: expectedValue,
      };

      const aggregatedResult = aggregate(inputs, metrics, PARAMETERS);

      expect(aggregatedResult).toEqual(expectedResult);
    });

    it('should successfully calculate sum.', () => {
      const inputs = [
        {
          'disk-io': 10,
        },
        {
          'disk-io': 20,
        },
      ];
      const metrics = ['disk-io'];

      const expectedKey = `aggregated-${Object.keys(inputs[0])[0]}`;
      const expectedValue = inputs[0]['disk-io'] + inputs[1]['disk-io'];
      const expectedResult = {
        [`${expectedKey}`]: expectedValue,
      };

      const aggregatedResult = aggregate(inputs, metrics, PARAMETERS);

      expect(aggregatedResult).toEqual(expectedResult);
    });
  });
});
