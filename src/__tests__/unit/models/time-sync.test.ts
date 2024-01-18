import {TimeSyncModel} from '../../../models';

import {ERRORS} from '../../../util/errors';

import {STRINGS} from '../../../config';

const {InputValidationError} = ERRORS;

const {
  INVALID_TIME_NORMALIZATION,
  INVALID_TIME_INTERVAL,
  INVALID_OBSERVATION_OVERLAP,
} = STRINGS;

describe('models/time-sync: ', () => {
  describe('class TimeSync: ', () => {
    it('initializes object with required properties.', () => {
      const timeModel = new TimeSyncModel();

      expect(timeModel).toHaveProperty('configure');
      expect(timeModel).toHaveProperty('execute');
    });
  });
});

const basicConfig = {
  'start-time': '2023-12-12T00:00:00.000Z',
  'end-time': '2023-12-12T00:01:00.000Z',
  interval: 5,
  'error-on-padding': false,
};

describe('configure(): ', () => {
  it('configures model with required params.', async () => {
    const timeModel = await new TimeSyncModel().configure(basicConfig);

    expect(timeModel).toBeInstanceOf(TimeSyncModel);
  });
});

describe('execute(): ', () => {
  it('throws error if `start-time` is missing.', async () => {
    const invalidStartTimeConfig = {
      'start-time': '',
      'end-time': '2023-12-12T00:01:00.000Z',
      interval: 5,
      'error-on-padding': false,
    };

    const timeModel = await new TimeSyncModel().configure(
      invalidStartTimeConfig
    );

    expect.assertions(1);

    try {
      await timeModel.execute([
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 10,
          'cpu-util': 10,
        },
        {
          timestamp: '2023-12-12T00:00:10.000Z',
          duration: 30,
          'cpu-util': 20,
        },
      ]);
    } catch (error) {
      expect(error).toStrictEqual(
        new InputValidationError(INVALID_TIME_NORMALIZATION)
      );
    }
  });

  it('throws error if `end-time` is missing.', async () => {
    const invalidEndTimeConfig = {
      'start-time': '2023-12-12T00:01:00.000Z',
      'end-time': '',
      interval: 5,
      'error-on-padding': false,
    };
    const timeModel = await new TimeSyncModel().configure(invalidEndTimeConfig);

    expect.assertions(1);

    try {
      await timeModel.execute([
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 10,
          'cpu-util': 10,
        },
        {
          timestamp: '2023-12-12T00:00:10.000Z',
          duration: 30,
          'cpu-util': 20,
        },
      ]);
    } catch (error) {
      expect(error).toStrictEqual(
        new InputValidationError(INVALID_TIME_NORMALIZATION)
      );
    }
  });

  it('throws error if interval is invalid.', async () => {
    const invalidIntervalConfig = {
      'start-time': '2023-12-12T00:00:00.000Z',
      'end-time': '2023-12-12T00:01:00.000Z',
      interval: 0,
      'error-on-padding': false,
    };

    const timeModel = await new TimeSyncModel().configure(
      invalidIntervalConfig
    );

    expect.assertions(1);

    try {
      await timeModel.execute([
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 15,
          'cpu-util': 10,
        },
        {
          timestamp: '2023-12-12T00:00:10.000Z',
          duration: 30,
          'cpu-util': 20,
        },
      ]);
    } catch (error) {
      expect(error).toStrictEqual(
        new InputValidationError(INVALID_TIME_INTERVAL)
      );
    }
  });

  it('throws error if timestamps overlap.', async () => {
    const basicConfig = {
      'start-time': '2023-12-12T00:00:00.000Z',
      'end-time': '2023-12-12T00:01:00.000Z',
      interval: 5,
      'error-on-padding': false,
    };

    const timeModel = await new TimeSyncModel().configure(basicConfig);

    try {
      await timeModel.execute([
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 15,
          'cpu-util': 10,
        },
        {
          timestamp: '2023-12-12T00:00:10.000Z',
          duration: 30,
          'cpu-util': 20,
        },
      ]);
    } catch (error) {
      expect(error).toStrictEqual(
        new InputValidationError(INVALID_OBSERVATION_OVERLAP)
      );
    }
  });

  it('throws error if end is before start in global config.', async () => {
    const basicConfig = {
      'start-time': '2023-12-12T00:00:10.000Z',
      'end-time': '2023-12-12T00:00:00.000Z',
      interval: 5,
      'error-on-padding': false,
    };

    const timeModel = await new TimeSyncModel().configure(basicConfig);

    try {
      await timeModel.execute([
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 15,
          'cpu-util': 10,
        },
        {
          timestamp: '2023-12-12T00:00:10.000Z',
          duration: 30,
          'cpu-util': 20,
        },
      ]);
    } catch (error) {
      expect(error).toStrictEqual(
        new InputValidationError('Start time or end time is missing.')
      );
    }
  });

  it('throws error if end is before start in observation timestamps.', async () => {
    const basicConfig = {
      'start-time': '2023-12-12T00:00:00.000Z',
      'end-time': '2023-12-12T00:00:10.000Z',
      interval: 5,
      'error-on-padding': false,
    };

    const timeModel = await new TimeSyncModel().configure(basicConfig);

    try {
      await timeModel.execute([
        {
          timestamp: '2023-12-12T00:00:10.000Z',
          duration: 1,
          'cpu-util': 10,
        },
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 30,
          'cpu-util': 20,
        },
      ]);
    } catch (error) {
      expect(error).toStrictEqual(
        new InputValidationError(INVALID_OBSERVATION_OVERLAP)
      );
    }
  });

  it('checks braking down observations case, if padding and zeroish objects are not needed.', async () => {
    const basicConfig = {
      'start-time': '2023-12-12T00:00:00.000Z',
      'end-time': '2023-12-12T00:00:10.000Z',
      interval: 1,
      'error-on-padding': false,
    };

    const timeModel = await new TimeSyncModel().configure(basicConfig);

    const result = await timeModel.execute([
      {
        timestamp: '2023-12-12T00:00:00.000Z',
        duration: 5,
        'cpu-util': 10,
      },
      {
        timestamp: '2023-12-12T00:00:05.000Z',
        duration: 5,
        'cpu-util': 10,
      },
    ]);

    const expectedResult = [
      {
        'cpu-util': 10,
        duration: 1,
        timestamp: '2023-12-12T00:00:00.000Z',
      },
      {
        'cpu-util': 10,
        duration: 1,
        timestamp: '2023-12-12T00:00:01.000Z',
      },
      {
        'cpu-util': 10,
        duration: 1,
        timestamp: '2023-12-12T00:00:02.000Z',
      },
      {
        'cpu-util': 10,
        duration: 1,
        timestamp: '2023-12-12T00:00:03.000Z',
      },
      {
        'cpu-util': 10,
        duration: 1,
        timestamp: '2023-12-12T00:00:04.000Z',
      },
      {
        'cpu-util': 10,
        duration: 1,
        timestamp: '2023-12-12T00:00:05.000Z',
      },
      {
        'cpu-util': 10,
        duration: 1,
        timestamp: '2023-12-12T00:00:06.000Z',
      },
      {
        'cpu-util': 10,
        duration: 1,
        timestamp: '2023-12-12T00:00:07.000Z',
      },
      {
        'cpu-util': 10,
        duration: 1,
        timestamp: '2023-12-12T00:00:08.000Z',
      },
      {
        'cpu-util': 10,
        duration: 1,
        timestamp: '2023-12-12T00:00:09.000Z',
      },
    ];

    expect(result).toStrictEqual(expectedResult);
  });

  it('checks if padding done if global time frame is bigger than observations frame.', async () => {
    const basicConfig = {
      'start-time': '2023-12-12T00:00:00.000Z',
      'end-time': '2023-12-12T00:00:20.000Z',
      interval: 1,
      'error-on-padding': false,
    };

    const timeModel = await new TimeSyncModel().configure(basicConfig);

    const result = await timeModel.execute([
      {
        timestamp: '2023-12-12T00:00:05.000Z',
        duration: 5,
        'cpu-util': 10,
        carbon: 20,
        'time-reserved': 10,
      },
      {
        timestamp: '2023-12-12T00:00:10.000Z',
        duration: 5,
        'cpu-util': 10,
        carbon: 20,
        'time-reserved': 10,
      },
    ]);

    const expectedResult = [
      {
        'cpu-util': 0,
        carbon: 0,
        duration: 1,
        timestamp: '2023-12-12T00:00:00.000Z',
        'time-reserved': 1,
      },
      {
        'cpu-util': 0,
        carbon: 0,
        duration: 1,
        timestamp: '2023-12-12T00:00:01.000Z',
        'time-reserved': 1,
      },
      {
        'cpu-util': 0,
        carbon: 0,
        duration: 1,
        timestamp: '2023-12-12T00:00:02.000Z',
        'time-reserved': 1,
      },
      {
        'cpu-util': 0,
        carbon: 0,
        duration: 1,
        timestamp: '2023-12-12T00:00:03.000Z',
        'time-reserved': 1,
      },
      {
        'cpu-util': 0,
        carbon: 0,
        duration: 1,
        timestamp: '2023-12-12T00:00:04.000Z',
        'time-reserved': 1,
      },
      {
        'cpu-util': 10,
        carbon: 4,
        duration: 1,
        timestamp: '2023-12-12T00:00:05.000Z',
        'time-reserved': 10,
      },
      {
        'cpu-util': 10,
        carbon: 4,
        duration: 1,
        timestamp: '2023-12-12T00:00:06.000Z',
        'time-reserved': 10,
      },
      {
        'cpu-util': 10,
        carbon: 4,
        duration: 1,
        timestamp: '2023-12-12T00:00:07.000Z',
        'time-reserved': 10,
      },
      {
        'cpu-util': 10,
        carbon: 4,
        duration: 1,
        timestamp: '2023-12-12T00:00:08.000Z',
        'time-reserved': 10,
      },
      {
        'cpu-util': 10,
        carbon: 4,
        duration: 1,
        timestamp: '2023-12-12T00:00:09.000Z',
        'time-reserved': 10,
      },
      {
        'cpu-util': 10,
        carbon: 4,
        duration: 1,
        timestamp: '2023-12-12T00:00:10.000Z',
        'time-reserved': 10,
      },
      {
        'cpu-util': 10,
        carbon: 4,
        duration: 1,
        timestamp: '2023-12-12T00:00:11.000Z',
        'time-reserved': 10,
      },
      {
        'cpu-util': 10,
        carbon: 4,
        duration: 1,
        timestamp: '2023-12-12T00:00:12.000Z',
        'time-reserved': 10,
      },
      {
        'cpu-util': 10,
        carbon: 4,
        duration: 1,
        timestamp: '2023-12-12T00:00:13.000Z',
        'time-reserved': 10,
      },
      {
        'cpu-util': 10,
        carbon: 4,
        duration: 1,
        timestamp: '2023-12-12T00:00:14.000Z',
        'time-reserved': 10,
      },
      {
        'cpu-util': 0,
        carbon: 0,
        duration: 1,
        timestamp: '2023-12-12T00:00:15.000Z',
        'time-reserved': 1,
      },
      {
        'cpu-util': 0,
        carbon: 0,
        duration: 1,
        timestamp: '2023-12-12T00:00:16.000Z',
        'time-reserved': 1,
      },
      {
        'cpu-util': 0,
        carbon: 0,
        duration: 1,
        timestamp: '2023-12-12T00:00:17.000Z',
        'time-reserved': 1,
      },
      {
        'cpu-util': 0,
        carbon: 0,
        duration: 1,
        timestamp: '2023-12-12T00:00:18.000Z',
        'time-reserved': 1,
      },
      {
        'cpu-util': 0,
        carbon: 0,
        duration: 1,
        timestamp: '2023-12-12T00:00:19.000Z',
        'time-reserved': 1,
      },
      {
        'cpu-util': 0,
        carbon: 0,
        duration: 1,
        timestamp: '2023-12-12T00:00:20.000Z',
        'time-reserved': 1,
      },
    ];

    expect(result).toStrictEqual(expectedResult);
  });

  /**
   * Checks also while resampling inputs, is average calculated for time frame.
   */
  it('checks if padding done with interval higher than `1`, if global time frame is bigger than observations frame.', async () => {
    const basicConfig = {
      'start-time': '2023-12-12T00:00:00.000Z',
      'end-time': '2023-12-12T00:00:20.000Z',
      interval: 5,
      'error-on-padding': false,
    };

    const timeModel = await new TimeSyncModel().configure(basicConfig);

    const result = await timeModel.execute([
      {
        timestamp: '2023-12-12T00:00:05.000Z',
        duration: 5,
        'cpu-util': 10,
        carbon: 20,
        'time-reserved': 10,
      },
      {
        timestamp: '2023-12-12T00:00:10.000Z',
        duration: 5,
        'cpu-util': 10,
        carbon: 20,
        'time-reserved': 10,
      },
    ]);

    const expectedResult = [
      {
        timestamp: '2023-12-12T00:00:00.000Z',
        duration: 5,
        'cpu-util': 0,
        carbon: 0,
        'time-reserved': 0.8,
      },
      {
        timestamp: '2023-12-12T00:00:05.000Z',
        duration: 5,
        'cpu-util': 8,
        carbon: 20,
        'time-reserved': 8,
      },
      {
        timestamp: '2023-12-12T00:00:10.000Z',
        duration: 5,
        'cpu-util': 8,
        carbon: 20,
        'time-reserved': 8,
      },
      {
        timestamp: '2023-12-12T00:00:15.000Z',
        duration: 5,
        'cpu-util': 0,
        carbon: 0,
        'time-reserved': 0.8,
      },
      {
        timestamp: '2023-12-12T00:00:20.000Z',
        duration: 1,
        'cpu-util': 0,
        carbon: 0,
        'time-reserved': 1,
      },
    ];

    expect(result).toStrictEqual(expectedResult);
  });

  it('checks if 0ish inputs are applied if there is a gap in time frame.', async () => {
    const basicConfig = {
      'start-time': '2023-12-12T00:00:00.000Z',
      'end-time': '2023-12-12T00:00:10.000Z',
      interval: 1,
      'error-on-padding': false,
    };

    const timeModel = await new TimeSyncModel().configure(basicConfig);

    const result = await timeModel.execute([
      {
        timestamp: '2023-12-12T00:00:00.000Z',
        duration: 2,
        'cpu-util': 10,
        carbon: 20,
        'time-reserved': 10,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:05.000Z',
        duration: 6,
        'cpu-util': 10,
        carbon: 20,
        'time-reserved': 10,
        'total-resources': 4,
      },
    ]);

    const expectedResult = [
      {
        timestamp: '2023-12-12T00:00:00.000Z',
        duration: 1,
        'cpu-util': 10,
        carbon: 10,
        'time-reserved': 10,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:01.000Z',
        duration: 1,
        'cpu-util': 10,
        carbon: 10,
        'time-reserved': 10,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:02.000Z',
        duration: 1,
        'cpu-util': 0,
        carbon: 0,
        'time-reserved': 1,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:03.000Z',
        duration: 1,
        'cpu-util': 0,
        carbon: 0,
        'time-reserved': 1,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:04.000Z',
        duration: 1,
        'cpu-util': 0,
        carbon: 0,
        'time-reserved': 1,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:05.000Z',
        duration: 1,
        'cpu-util': 10,
        carbon: 3.3333333333333335,
        'time-reserved': 10,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:06.000Z',
        duration: 1,
        'cpu-util': 10,
        carbon: 3.3333333333333335,
        'time-reserved': 10,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:07.000Z',
        duration: 1,
        'cpu-util': 10,
        carbon: 3.3333333333333335,
        'time-reserved': 10,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:08.000Z',
        duration: 1,
        'cpu-util': 10,
        carbon: 3.3333333333333335,
        'time-reserved': 10,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:09.000Z',
        duration: 1,
        'cpu-util': 10,
        carbon: 3.3333333333333335,
        'time-reserved': 10,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:10.000Z',
        duration: 1,
        'cpu-util': 10,
        carbon: 3.3333333333333335,
        'time-reserved': 10,
        'total-resources': 4,
      },
    ];

    expect(result).toStrictEqual(expectedResult);
  });

  it('checks if time series is trimmed when global timeframe is smaller than observed timeframe.', async () => {
    const basicConfig = {
      'start-time': '2023-12-12T00:00:05.000Z',
      'end-time': '2023-12-12T00:00:10.000Z',
      interval: 1,
      'error-on-padding': false,
    };

    const timeModel = await new TimeSyncModel().configure(basicConfig);

    const result = await timeModel.execute([
      {
        timestamp: '2023-12-12T00:00:00.000Z',
        duration: 2,
        'cpu-util': 10,
        carbon: 20,
        'time-reserved': 10,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:02.000Z',
        duration: 2,
        'cpu-util': 10,
        carbon: 20,
        'time-reserved': 10,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:04.000Z',
        duration: 2,
        'cpu-util': 10,
        carbon: 20,
        'time-reserved': 10,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:06.000Z',
        duration: 2,
        'cpu-util': 10,
        carbon: 20,
        'time-reserved': 10,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:08.000Z',
        duration: 2,
        'cpu-util': 10,
        carbon: 20,
        'time-reserved': 10,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:10.000Z',
        duration: 2,
        'cpu-util': 10,
        carbon: 20,
        'time-reserved': 10,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:12.000Z',
        duration: 2,
        'cpu-util': 10,
        carbon: 20,
        'time-reserved': 10,
        'total-resources': 4,
      },
    ]);

    const expectedResult = [
      {
        timestamp: '2023-12-12T00:00:05.000Z',
        duration: 1,
        'cpu-util': 10,
        carbon: 10,
        'time-reserved': 10,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:06.000Z',
        duration: 1,
        'cpu-util': 10,
        carbon: 10,
        'time-reserved': 10,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:07.000Z',
        duration: 1,
        'cpu-util': 10,
        carbon: 10,
        'time-reserved': 10,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:08.000Z',
        duration: 1,
        'cpu-util': 10,
        carbon: 10,
        'time-reserved': 10,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:09.000Z',
        duration: 1,
        'cpu-util': 10,
        carbon: 10,
        'time-reserved': 10,
        'total-resources': 4,
      },
      {
        timestamp: '2023-12-12T00:00:10.000Z',
        duration: 1,
        'cpu-util': 10,
        carbon: 10,
        'time-reserved': 10,
        'total-resources': 4,
      },
    ];

    expect(result).toStrictEqual(expectedResult);
  });

  it('checks that metric (carbon) with aggregation-method == sum is properly spread over interpolated time points.', async () => {
    const basicConfig = {
      'start-time': '2023-12-12T00:00:00.000Z',
      'end-time': '2023-12-12T00:00:10.000Z',
      interval: 1,
      'error-on-padding': false,
    };

    const timeModel = await new TimeSyncModel().configure(basicConfig);

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

  it('checks that metric (cpu-util) with aggregation-method == avg is properly spread over interpolated time points.', async () => {
    const basicConfig = {
      'start-time': '2023-12-12T00:00:00.000Z',
      'end-time': '2023-12-12T00:00:09.000Z',
      interval: 5,
      'error-on-padding': false,
    };

    const timeModel = await new TimeSyncModel().configure(basicConfig);

    const result = await timeModel.execute([
      {
        timestamp: '2023-12-12T00:00:00.000Z',
        duration: 3,
        'cpu-util': 10,
      },
      {
        timestamp: '2023-12-12T00:00:05.000Z',
        duration: 3,
        'cpu-util': 10,
      },
    ]);

    /**In each 5 second interval, 60% of the time cpu-util = 10, 40% of the time it is 0, so cpu-util in the averaged result be 6 */
    const expectedResult = [
      {
        timestamp: '2023-12-12T00:00:00.000Z',
        duration: 5,
        'cpu-util': 6,
      },
      {
        timestamp: '2023-12-12T00:00:05.000Z',
        duration: 5,
        'cpu-util': 6,
      },
    ];

    expect(result).toStrictEqual(expectedResult);
  });

  it('checks that constants are copied to results unchanged.', async () => {
    const basicConfig = {
      'start-time': '2023-12-12T00:00:00.000Z',
      'end-time': '2023-12-12T00:00:09.000Z',
      interval: 5,
      'error-on-padding': false,
    };

    const timeModel = await new TimeSyncModel().configure(basicConfig);

    const result = await timeModel.execute([
      {
        timestamp: '2023-12-12T00:00:00.000Z',
        duration: 3,
        'total-resources': 10,
      },
      {
        timestamp: '2023-12-12T00:00:05.000Z',
        duration: 3,
        'total-resources': 10,
      },
    ]);

    /**In each 5 second interval, 60% of the time cpu-util = 10, 40% of the time it is 0, so cpu-util in the averaged result be 6 */
    const expectedResult = [
      {
        timestamp: '2023-12-12T00:00:00.000Z',
        duration: 5,
        'total-resources': 10,
      },
      {
        timestamp: '2023-12-12T00:00:05.000Z',
        duration: 5,
        'total-resources': 10,
      },
    ];

    expect(result).toStrictEqual(expectedResult);
  });
});
