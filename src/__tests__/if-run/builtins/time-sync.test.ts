import {AGGREGATION_METHODS} from '@grnsft/if-core/consts';
import {ERRORS} from '@grnsft/if-core/utils';
import {Settings, DateTime} from 'luxon';

import {AggregationParams} from '../../../common/types/manifest';

import {storeAggregationMetrics} from '../../../if-run/lib/aggregate';
import {TimeSync} from '../../../if-run/builtins/time-sync';

import {STRINGS} from '../../../if-run/config';

Settings.defaultZone = 'utc';
const {
  InputValidationError,
  InvalidPaddingError,
  InvalidInputError,
  ConfigError,
} = ERRORS;

const {
  INCOMPATIBLE_RESOLUTION_WITH_INTERVAL,
  INCOMPATIBLE_RESOLUTION_WITH_GAPS,
  INVALID_OBSERVATION_OVERLAP,
  AVOIDING_PADDING_BY_EDGES,
} = STRINGS;

jest.mock('luxon', () => {
  const originalModule = jest.requireActual('luxon');
  return {
    ...originalModule,
    Interval: {
      ...originalModule.Interval,
      fromDateTimes: jest.fn((start, end) => ({
        start,
        end,
        splitBy: jest.fn(duration => {
          const intervals = [];
          let current = start;

          while (current < end) {
            intervals.push({
              start: process.env.MOCK_INTERVAL === 'true' ? null : current,
              end: current.plus(duration),
            });

            current = current.plus(duration);
          }

          return intervals;
        }),
      })),
    },
  };
});

describe('builtins/time-sync:', () => {
  beforeAll(() => {
    const metricStorage: AggregationParams = {
      metrics: [
        'carbon',
        'cpu/utilization',
        'time-reserved',
        'resources-total',
      ],
      type: 'horizontal',
    };
    const convertedMetrics = metricStorage.metrics.map((metric: string) => ({
      [metric]: {
        time: AGGREGATION_METHODS[2],
        component: AGGREGATION_METHODS[2],
      },
    }));
    storeAggregationMetrics(...convertedMetrics);
  });

  describe('time-sync: ', () => {
    const basicConfig = {
      'start-time': '2023-12-12T00:01:00.000Z',
      'end-time': '2023-12-12T00:01:00.000Z',
      interval: 5,
      'allow-padding': true,
    };

    const parametersMetadata = {
      inputs: {},
      outputs: {},
    };
    const timeSync = TimeSync(basicConfig, parametersMetadata, {});

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(timeSync).toHaveProperty('metadata');
        expect(timeSync).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('throws error if `start-time` is missing.', async () => {
        const invalidStartTimeConfig = {
          'start-time': '',
          'end-time': '2023-12-12T00:01:00.000Z',
          interval: 5,
          'allow-padding': true,
        };
        const timeModel = TimeSync(
          invalidStartTimeConfig,
          parametersMetadata,
          {}
        );

        expect.assertions(1);

        try {
          await timeModel.execute([
            {
              timestamp: '2023-12-12T00:00:00.000Z',
              duration: 10,
              'cpu/utilization': 10,
            },
            {
              timestamp: '2023-12-12T00:00:10.000Z',
              duration: 30,
              'cpu/utilization': 20,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError(
              '"start-time" parameter is invalid datetime. Error code: invalid_string.'
            )
          );
        }
      });

      it('throws error if `end-time` is missing.', async () => {
        const errorMessage =
          '"end-time" parameter is invalid datetime. Error code: invalid_string.,`start-time` should be lower than `end-time`';
        const invalidEndTimeConfig = {
          'start-time': '2023-12-12T00:01:00.000Z',
          'end-time': '',
          interval: 5,
          'allow-padding': true,
        };
        const timeModel = TimeSync(
          invalidEndTimeConfig,
          parametersMetadata,
          {}
        );

        expect.assertions(1);

        try {
          await timeModel.execute([
            {
              timestamp: '2023-12-12T00:00:00.000Z',
              duration: 10,
              'cpu/utilization': 10,
            },
            {
              timestamp: '2023-12-12T00:00:10.000Z',
              duration: 30,
              'cpu/utilization': 20,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(new InputValidationError(errorMessage));
        }
      });

      it('fails if `start-time` is not a valid ISO date.', async () => {
        const invalidStartTimeConfig = {
          'start-time': '0023-X',
          'end-time': '2023-12-12T00:01:00.000Z',
          interval: 5,
          'allow-padding': true,
        };
        const timeModel = TimeSync(
          invalidStartTimeConfig,
          parametersMetadata,
          {}
        );
        expect.assertions(1);
        try {
          await timeModel.execute([
            {
              timestamp: '2023-12-12T00:00:00.000Z',
              duration: 10,
              'cpu/utilization': 10,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError(
              '"start-time" parameter is invalid datetime. Error code: invalid_string.'
            )
          );
        }
      });

      it('fails if `end-time` is not a valid ISO date.', async () => {
        const invalidEndTimeConfig = {
          'start-time': '2023-12-12T00:01:00.000Z',
          'end-time': '20XX',
          interval: 5,
          'allow-padding': true,
        };

        const timeModel = TimeSync(
          invalidEndTimeConfig,
          parametersMetadata,
          {}
        );

        expect.assertions(1);
        try {
          await timeModel.execute([
            {
              timestamp: '2023-12-12T00:00:00.000Z',
              duration: 10,
              'cpu/utilization': 10,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError(
              '"end-time" parameter is invalid datetime. Error code: invalid_string.'
            )
          );
        }
      });

      it('throws error on missing config.', async () => {
        const config = undefined;
        const timeModel = TimeSync(config!, parametersMetadata, {});

        expect.assertions(1);

        try {
          await timeModel.execute([
            {
              timestamp: '2023-12-12T00:00:00.000Z',
              duration: 15,
              'cpu/utilization': 10,
            },
            {
              timestamp: '2023-12-12T00:00:10.000Z',
              duration: 30,
              'cpu/utilization': 20,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new ConfigError('Config is not provided.')
          );
        }
      });

      it('throws error if interval is invalid.', async () => {
        const invalidIntervalConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:01:00.000Z',
          interval: 0,
          'allow-padding': true,
        };
        const timeModel = TimeSync(
          invalidIntervalConfig,
          parametersMetadata,
          {}
        );

        expect.assertions(1);

        try {
          await timeModel.execute([
            {
              timestamp: '2023-12-12T00:00:00.000Z',
              duration: 15,
              'cpu/utilization': 10,
            },
            {
              timestamp: '2023-12-12T00:00:10.000Z',
              duration: 30,
              'cpu/utilization': 20,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InvalidInputError(INVALID_OBSERVATION_OVERLAP)
          );
        }
      });

      it('throws error if timestamps overlap.', async () => {
        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:01:00.000Z',
          interval: 5,
          'allow-padding': true,
        };
        const timeModel = TimeSync(basicConfig, parametersMetadata, {});

        try {
          await timeModel.execute([
            {
              timestamp: '2023-12-12T00:00:00.000Z',
              duration: 15,
              'cpu/utilization': 10,
            },
            {
              timestamp: '2023-12-12T00:00:10.000Z',
              duration: 30,
              'cpu/utilization': 20,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InvalidInputError(INVALID_OBSERVATION_OVERLAP)
          );
        }
      });

      it('throws error if `timestamp` is missing.', async () => {
        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:01:00.000Z',
          interval: 5,
          'allow-padding': true,
        };
        const timeModel = TimeSync(basicConfig, parametersMetadata, {});

        try {
          await timeModel.execute([
            {
              duration: 15,
              'cpu/utilization': 10,
            },
            {
              timestamp: '2023-12-12T00:00:10.000Z',
              duration: 30,
              'cpu/utilization': 20,
            },
          ]);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
          expect(error).toStrictEqual(
            new InputValidationError(
              '"timestamp" parameter is required at index 0. Error code: invalid_union.'
            )
          );
        }
      });

      it('throws error if the seconds `timestamp` is above 60.', async () => {
        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:01:00.000Z',
          interval: 5,
          'allow-padding': true,
        };
        const timeModel = TimeSync(basicConfig, parametersMetadata, {});

        try {
          await timeModel.execute([
            {
              timestamp: '2023-12-12T00:00:90.000Z',
              duration: 15,
              'cpu/utilization': 10,
            },
            {
              timestamp: '2023-12-12T00:00:10.000Z',
              duration: 30,
              'cpu/utilization': 20,
            },
          ]);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
          expect(error).toStrictEqual(
            new InputValidationError(
              '"timestamp" parameter is invalid datetime at index 0. Error code: invalid_string.'
            )
          );
        }
      });

      it('throws an error if the `timestamp` is not valid date.', async () => {
        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:01:00.000Z',
          interval: 10,
          'allow-padding': true,
        };
        const data = [
          {
            timestamp: 45,
            duration: 10,
            'cpu/utilization': 10,
          },
        ];
        const timeModel = TimeSync(basicConfig, parametersMetadata, {});
        expect.assertions(2);

        try {
          await timeModel.execute(data);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
          expect(error).toStrictEqual(
            new InputValidationError(
              '"timestamp" parameter is expected string, received number at index 0. Error code: invalid_union.'
            )
          );
        }
      });

      it('throws error if end is before start in global config.', async () => {
        const basicConfig = {
          'start-time': '2023-12-12T00:00:10.000Z',
          'end-time': '2023-12-12T00:00:00.000Z',
          interval: 5,
          'allow-padding': true,
        };
        const timeModel = TimeSync(basicConfig, parametersMetadata, {});

        try {
          await timeModel.execute([
            {
              timestamp: '2023-12-12T00:00:00.000Z',
              duration: 15,
              'cpu/utilization': 10,
            },
            {
              timestamp: '2023-12-12T00:00:10.000Z',
              duration: 30,
              'cpu/utilization': 20,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError(
              '`start-time` should be lower than `end-time`'
            )
          );
        }
      });

      it('converts Date objects to string outputs.', async () => {
        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:00:01.000Z',
          interval: 1,
          'allow-padding': false,
        };
        const timeModel = TimeSync(basicConfig, parametersMetadata, {});

        const result = await timeModel.execute([
          {
            timestamp: '2023-12-12T00:00:00.000Z',
            duration: 1,
            'cpu/utilization': 10,
          },
          {
            timestamp: new Date('2023-12-12T00:00:01.000Z'),
            duration: 1,
            'cpu/utilization': 10,
          },
        ]);

        const expectedResult = [
          {
            timestamp: '2023-12-12T00:00:00.000Z',
            duration: 1,
            'cpu/utilization': 10,
          },
          {
            timestamp: '2023-12-12T00:00:01.000Z',
            duration: 1,
            'cpu/utilization': 10,
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('checks that metric (carbon) with aggregation-method == sum is properly spread over interpolated time points.', async () => {
        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:00:10.000Z',
          interval: 1,
          'allow-padding': true,
        };

        storeAggregationMetrics({
          carbon: {
            time: 'sum',
            component: 'sum',
          },
        });

        const timeModel = TimeSync(basicConfig, parametersMetadata, {});

        const result = await timeModel.execute([
          {
            timestamp: '2023-12-12T00:00:00.000Z',
            duration: 10,
            carbon: 10,
          },
        ]);

        const expectedResult = [
          {
            timestamp: '2023-12-12T00:00:00.000Z',
            duration: 1,
            carbon: 1,
          },
          {
            timestamp: '2023-12-12T00:00:01.000Z',
            duration: 1,
            carbon: 1,
          },
          {
            timestamp: '2023-12-12T00:00:02.000Z',
            duration: 1,
            carbon: 1,
          },
          {
            timestamp: '2023-12-12T00:00:03.000Z',
            duration: 1,
            carbon: 1,
          },
          {
            timestamp: '2023-12-12T00:00:04.000Z',
            duration: 1,
            carbon: 1,
          },
          {
            timestamp: '2023-12-12T00:00:05.000Z',
            duration: 1,
            carbon: 1,
          },
          {
            timestamp: '2023-12-12T00:00:06.000Z',
            duration: 1,
            carbon: 1,
          },
          {
            timestamp: '2023-12-12T00:00:07.000Z',
            duration: 1,
            carbon: 1,
          },
          {
            timestamp: '2023-12-12T00:00:08.000Z',
            duration: 1,
            carbon: 1,
          },
          {
            timestamp: '2023-12-12T00:00:09.000Z',
            duration: 1,
            carbon: 1,
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('checks that constants are copied to results unchanged.', async () => {
        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:00:09.000Z',
          interval: 5,
          'allow-padding': true,
        };
        const timeModel = TimeSync(basicConfig, parametersMetadata, {});

        const result = await timeModel.execute([
          {
            timestamp: '2023-12-12T00:00:00.000Z',
            duration: 3,
            'resources-total': 10,
          },
          {
            timestamp: '2023-12-12T00:00:05.000Z',
            duration: 3,
            'resources-total': 10,
          },
        ]);

        /**In each 5 second interval, 60% of the time cpu/utilization = 10, 40% of the time it is 0, so cpu/utilization in the averaged result be 6 */
        const expectedResult = [
          {
            timestamp: '2023-12-12T00:00:00.000Z',
            duration: 5,
            'resources-total': 10,
          },
          {
            timestamp: '2023-12-12T00:00:05.000Z',
            duration: 4,
            'resources-total': 10,
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('returns a result when `time-reserved` persists.', async () => {
        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:00:09.000Z',
          interval: 5,
          'allow-padding': true,
        };

        storeAggregationMetrics({
          'time-reserved': {
            time: 'avg',
            component: 'avg',
          },
        });
        storeAggregationMetrics({
          'resources-total': {
            time: 'sum',
            component: 'sum',
          },
        });

        const timeModel = TimeSync(basicConfig, parametersMetadata, {});

        const result = await timeModel.execute([
          {
            timestamp: '2023-12-12T00:00:00.000Z',
            duration: 3,
            'time-reserved': 5,
            'resources-total': 10,
          },
          {
            timestamp: '2023-12-12T00:00:05.000Z',
            duration: 3,
            'time-reserved': 5,
            'resources-total': 10,
          },
        ]);

        const expectedResult = [
          {
            timestamp: '2023-12-12T00:00:00.000Z',
            duration: 5,
            'resources-total': 10,
            'time-reserved': 3.2,
          },
          {
            timestamp: '2023-12-12T00:00:05.000Z',
            duration: 4,
            'resources-total': 10,
            'time-reserved': 3.75,
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('returns a result when `mapping` has valid data.', async () => {
        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:00:09.000Z',
          interval: 5,
          'allow-padding': true,
        };
        const mapping = {
          'time-reserved': 'time-allocated',
        };

        storeAggregationMetrics({
          'time-allocated': {
            time: 'avg',
            component: 'avg',
          },
        });
        storeAggregationMetrics({
          'resources-total': {
            time: 'sum',
            component: 'sum',
          },
        });

        const timeModel = TimeSync(basicConfig, parametersMetadata, mapping);

        const result = await timeModel.execute([
          {
            timestamp: '2023-12-12T00:00:00.000Z',
            duration: 3,
            'time-allocated': 5,
            'resources-total': 10,
          },
          {
            timestamp: '2023-12-12T00:00:05.000Z',
            duration: 3,
            'time-allocated': 5,
            'resources-total': 10,
          },
        ]);

        const expectedResult = [
          {
            timestamp: '2023-12-12T00:00:00.000Z',
            duration: 5,
            'resources-total': 10,
            'time-allocated': 3.2,
          },
          {
            timestamp: '2023-12-12T00:00:05.000Z',
            duration: 4,
            'resources-total': 10,
            'time-allocated': 3.75,
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('throws an error when `start-time` is wrong.', async () => {
        process.env.MOCK_INTERVAL = 'true';
        const basicConfig = {
          'start-time': '2023-12-12T00:00:90.000Z',
          'end-time': '2023-12-12T00:01:09.000Z',
          interval: 5,
          'allow-padding': true,
        };
        const timeModel = TimeSync(basicConfig, parametersMetadata, {});

        try {
          await timeModel.execute([
            {
              timestamp: '2023-12-12T00:00:00.000Z',
              duration: 30,
              'cpu/utilization': 20,
            },
          ]);
        } catch (error) {
          expect(error).toBeInstanceOf(InputValidationError);
          expect(error).toStrictEqual(
            new InputValidationError(
              '"start-time" parameter is invalid datetime. Error code: invalid_string.'
            )
          );
        }
      });

      it('returns a result when the first timestamp in the input has time padding.', async () => {
        process.env.MOCK_INTERVAL = 'false';
        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:00:09.000Z',
          interval: 5,
          'allow-padding': true,
        };

        storeAggregationMetrics({
          'resources-total': {
            time: 'none',
            component: 'none',
          },
        });

        const timeModel = TimeSync(basicConfig, parametersMetadata, {});

        const result = await timeModel.execute([
          {
            timestamp: '2023-12-12T00:00:05.000Z',
            duration: 3,
            'resources-total': 10,
          },
          {
            timestamp: '2023-12-12T00:00:10.000Z',
            duration: 3,
            'resources-total': 10,
          },
        ]);

        const expectedResult = [
          {
            timestamp: '2023-12-12T00:00:00.000Z',
            duration: 5,
            'resources-total': null,
          },
          {
            timestamp: '2023-12-12T00:00:05.000Z',
            duration: 5,
            'resources-total': null,
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('throws error if padding is required at start while allow-padding = false.', async () => {
        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:00:10.000Z',
          interval: 5,
          'allow-padding': false,
        };
        const timeModel = TimeSync(basicConfig, parametersMetadata, {});

        try {
          await timeModel.execute([
            {
              timestamp: '2023-12-12T00:00:02.000Z',
              duration: 15,
              'cpu/utilization': 10,
            },
            {
              timestamp: '2023-12-12T00:00:10.000Z',
              duration: 30,
              'cpu/utilization': 20,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InvalidPaddingError(AVOIDING_PADDING_BY_EDGES(true, false))
          );
        }
      });

      it('throws error if padding is required at end while allow-padding = false.', async () => {
        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:00:10.000Z',
          interval: 5,
          'allow-padding': false,
        };
        const timeModel = TimeSync(basicConfig, parametersMetadata, {});

        try {
          await timeModel.execute([
            {
              timestamp: '2023-12-12T00:00:00.000Z',
              duration: 10,
              'cpu/utilization': 10,
            },
            {
              timestamp: '2023-12-12T00:00:10.000Z',
              duration: 30,
              'cpu/utilization': 20,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError('Avoiding padding at end')
          );
        }
      });

      it('throws error if padding is required at start and end while allow-padding = false.', async () => {
        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:00:10.000Z',
          interval: 5,
          'allow-padding': false,
        };
        const timeModel = TimeSync(basicConfig, parametersMetadata, {});

        try {
          await timeModel.execute([
            {
              timestamp: '2023-12-12T00:00:02.000Z',
              duration: 10,
              'cpu/utilization': 10,
            },
            {
              timestamp: '2023-12-12T00:00:08.000Z',
              duration: 1,
              'cpu/utilization': 20,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InvalidPaddingError(AVOIDING_PADDING_BY_EDGES(true, true))
          );
        }
      });

      it('checks that timestamps in return object are ISO 8061 and timezone UTC.', async () => {
        process.env.MOCK_INTERVAL = 'false';
        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:00:03.000Z',
          interval: 1,
          'allow-padding': true,
        };
        const timeModel = TimeSync(basicConfig, parametersMetadata, {});
        const result = await timeModel.execute([
          {
            timestamp: '2023-12-12T00:00:00.000Z',
            duration: 1,
            carbon: 1,
          },
        ]);
        expect(
          DateTime.fromISO(result[0].timestamp).zone.valueOf() ===
            'FixedOffsetZone { fixed: 0 }'
        );
        expect(DateTime.fromISO(result[0].timestamp).offset === 0);
      });

      it('successfully executes when the `duration` contains an arithmetic expression.', async () => {
        expect.assertions(1);

        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:00:10.000Z',
          interval: 5,
          'allow-padding': true,
        };
        const timeModel = TimeSync(basicConfig, parametersMetadata, {});

        const result = await timeModel.execute([
          {
            timestamp: '2023-12-12T00:00:00.000Z',
            duration: 3,
            'resources-total': 10,
          },
          {
            timestamp: '2023-12-12T00:00:05.000Z',
            duration: 3 * 2,
            'resources-total': 10,
          },
        ]);

        const expectedResult = [
          {
            timestamp: '2023-12-12T00:00:00.000Z',
            duration: 5,
            'resources-total': null,
          },
          {
            timestamp: '2023-12-12T00:00:05.000Z',
            duration: 5,
            'resources-total': null,
          },
          {
            timestamp: '2023-12-12T00:00:10.000Z',
            duration: 1,
            'resources-total': null,
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('should throw an error if the upsampling resolution is not compatible with the interval', async () => {
        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:00:03.000Z',
          interval: 3,
          'allow-padding': true,
          'upsampling-resolution': 2,
        };
        const timeModel = TimeSync(basicConfig, parametersMetadata, {});
        expect.assertions(1);
        try {
          await timeModel.execute([
            {
              timestamp: '2023-12-12T00:00:02.000Z',
              duration: 10,
              'cpu/utilization': 10,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new ConfigError(INCOMPATIBLE_RESOLUTION_WITH_INTERVAL)
          );
        }
      });

      it('should throw an error if the upsampling resolution is not compatible with paddings', async () => {
        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:00:12.000Z',
          interval: 2,
          'allow-padding': true,
          'upsampling-resolution': 2,
        };
        const timeModel = TimeSync(basicConfig, parametersMetadata, {});
        expect.assertions(1);
        try {
          await timeModel.execute([
            {
              timestamp: '2023-12-12T00:00:05.000Z',
              duration: 10,
              'cpu/utilization': 10,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new ConfigError(INCOMPATIBLE_RESOLUTION_WITH_GAPS)
          );
        }
      });

      it('should throw an error if the upsampling resolution is not compatible with gaps', async () => {
        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:00:12.000Z',
          interval: 5,
          'allow-padding': true,
          'upsampling-resolution': 5,
        };
        const timeModel = TimeSync(basicConfig, parametersMetadata, {});
        expect.assertions(1);
        try {
          await timeModel.execute([
            {
              timestamp: '2023-12-12T00:00:00.000Z',
              duration: 5,
            },
            {
              timestamp: '2023-12-12T00:00:07.000Z',
              duration: 5,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new ConfigError(INCOMPATIBLE_RESOLUTION_WITH_GAPS)
          );
        }
      });

      it('should upsample and resample correctly with a custom upsampling resolution given', async () => {
        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:00:20.000Z',
          interval: 5,
          'allow-padding': true,
          'upsampling-resolution': 5,
        };

        const timeModel = TimeSync(basicConfig, parametersMetadata, {});
        const result = await timeModel.execute([
          {
            timestamp: '2023-12-12T00:00:00.000Z',
            duration: 15,
          },
        ]);
        const expected = [
          {
            timestamp: '2023-12-12T00:00:00.000Z',
            duration: 5,
          },
          {
            timestamp: '2023-12-12T00:00:05.000Z',
            duration: 5,
          },
          {
            timestamp: '2023-12-12T00:00:10.000Z',
            duration: 5,
          },
          {
            timestamp: '2023-12-12T00:00:15.000Z',
            duration: 5,
          },
        ];
        expect(result).toEqual(expected);
      });

      it('checks that metric carbon with aggregation == sum is properly spread over interpolated time points with custom upsampling resolution given', async () => {
        const basicConfig = {
          'start-time': '2023-12-12T00:00:00.000Z',
          'end-time': '2023-12-12T00:00:15.000Z',
          interval: 5,
          'allow-padding': true,
          'upsampling-resolution': 5,
        };
        const timeModel = TimeSync(basicConfig, parametersMetadata, {});
        const result = await timeModel.execute([
          {
            timestamp: '2023-12-12T00:00:00.000Z',
            duration: 15,
            carbon: 3,
          },
        ]);

        const expected = [
          {
            timestamp: '2023-12-12T00:00:00.000Z',
            duration: 5,
            carbon: 1,
          },
          {
            timestamp: '2023-12-12T00:00:05.000Z',
            duration: 5,
            carbon: 1,
          },
          {
            timestamp: '2023-12-12T00:00:10.000Z',
            duration: 5,
            carbon: 1,
          },
        ];
        expect(result).toEqual(expected);
      });
    });
  });
});
