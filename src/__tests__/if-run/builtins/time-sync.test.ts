import {ERRORS} from '@grnsft/if-core/utils';
import {Settings, DateTime} from 'luxon';

import {AggregationParams} from '../../../common/types/manifest';

import {storeAggregationMetrics} from '../../../if-run/lib/aggregate';
import {TimeSync} from '../../../if-run/builtins/time-sync';

import {STRINGS} from '../../../if-run/config';
import {AGGREGATION_METHODS} from '../../../if-run/types/aggregation';

Settings.defaultZone = 'utc';
const {
  InputValidationError,
  InvalidPaddingError,
  InvalidDateInInputError,
  InvalidInputError,
  GlobalConfigError,
} = ERRORS;

const {
  INVALID_OBSERVATION_OVERLAP,
  INVALID_TIME_NORMALIZATION,
  AVOIDING_PADDING_BY_EDGES,
  INVALID_DATE_TYPE,
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
        splitBy: jest.fn(() => {
          const intervals = [];
          let current = start;

          while (current < end) {
            intervals.push({
              start: process.env.MOCK_INTERVAL === 'true' ? null : current,
              end: current.plus({seconds: 1}),
            });

            current = current.plus({seconds: 1});
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
      [metric]: AGGREGATION_METHODS[2],
    }));
    storeAggregationMetrics(...convertedMetrics);
  });

  describe('time-sync: ', () => {
    const parametersMetadata = {
      inputs: {},
      outputs: {},
    };
    const basicConfig = {
      'start-time': '2023-12-12T00:01:00.000Z',
      'end-time': '2023-12-12T00:01:00.000Z',
      interval: 5,
      'allow-padding': true,
    };

    const timeSync = TimeSync(basicConfig, parametersMetadata);

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(timeSync).toHaveProperty('metadata');
        expect(timeSync).toHaveProperty('execute');
      });
    });
  });
});

describe('execute(): ', () => {
  const parametersMetadata = {
    inputs: {},
    outputs: {},
  };

  it('throws error if `start-time` is missing.', async () => {
    const invalidStartTimeConfig = {
      'start-time': '',
      'end-time': '2023-12-12T00:01:00.000Z',
      interval: 5,
      'allow-padding': true,
    };

    const timeModel = TimeSync(invalidStartTimeConfig, parametersMetadata);

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
    const timeModel = TimeSync(invalidEndTimeConfig, parametersMetadata);

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
    const timeModel = TimeSync(invalidStartTimeConfig, parametersMetadata);
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
    const timeModel = TimeSync(invalidEndTimeConfig, parametersMetadata);

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
    const timeModel = TimeSync(config!, parametersMetadata);

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
        new GlobalConfigError(INVALID_TIME_NORMALIZATION)
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

    const timeModel = TimeSync(invalidIntervalConfig, parametersMetadata);

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

    const timeModel = TimeSync(basicConfig, parametersMetadata);

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

    const timeModel = TimeSync(basicConfig, parametersMetadata);

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
          '"timestamp" parameter is required in input[0]. Error code: invalid_union.'
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

    const timeModel = TimeSync(basicConfig, parametersMetadata);

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
          '"timestamp" parameter is invalid datetime in input[0]. Error code: invalid_string.'
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

    const timeModel = TimeSync(basicConfig, parametersMetadata);
    expect.assertions(2);

    try {
      await timeModel.execute(data);
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidDateInInputError);
      expect(error).toStrictEqual(
        new InvalidDateInInputError(INVALID_DATE_TYPE(data[0].timestamp))
      );
    }
  });

  it('throws error if end is before start in config.', async () => {
    const basicConfig = {
      'start-time': '2023-12-12T00:00:10.000Z',
      'end-time': '2023-12-12T00:00:00.000Z',
      interval: 5,
      'allow-padding': true,
    };

    const timeModel = TimeSync(basicConfig, parametersMetadata);

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
        new InputValidationError('`start-time` should be lower than `end-time`')
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

    const timeModel = TimeSync(basicConfig, parametersMetadata);

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
      },
      {
        timestamp: '2023-12-12T00:00:01.000Z',
        duration: 1,
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
    storeAggregationMetrics({carbon: 'sum'});

    const timeModel = TimeSync(basicConfig, parametersMetadata);

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

    const timeModel = TimeSync(basicConfig, parametersMetadata);

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

    const expectedResult = [
      {
        timestamp: '2023-12-12T00:00:00.000Z',
        duration: 5,
      },
      {
        timestamp: '2023-12-12T00:00:05.000Z',
        duration: 5,
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
    storeAggregationMetrics({'time-reserved': 'avg'});
    storeAggregationMetrics({'resources-total': 'sum'});

    const timeModel = TimeSync(basicConfig, parametersMetadata);

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
        duration: 5,
        'resources-total': 10,
        'time-reserved': 3.2,
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

    const timeModel = TimeSync(basicConfig, parametersMetadata);

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
    storeAggregationMetrics({'resources-total': 'none'});

    const timeModel = TimeSync(basicConfig, parametersMetadata);

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
        'resources-total': 10,
      },
      {
        timestamp: '2023-12-12T00:00:05.000Z',
        duration: 5,
        'resources-total': 10,
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

    const timeModel = TimeSync(basicConfig, parametersMetadata);

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

    const timeModel = TimeSync(basicConfig, parametersMetadata);

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

    const timeModel = TimeSync(basicConfig, parametersMetadata);

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

    const timeModel = TimeSync(basicConfig, parametersMetadata);
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
});
