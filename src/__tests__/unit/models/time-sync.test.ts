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

  it('throws error if timesteps overlap.', async () => {
    const basicConfig = {
      'start-time': '2023-12-12T00:00:00.000Z',
      'end-time': '2023-12-12T00:01:00.000Z',
      interval: 5,
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
        new InputValidationError('Observation timestamps overlap.')
      );
    }
  });

  it('throws error if end is before start in global config.', async () => {
    const basicConfig = {
      'start-time': '2023-12-12T00:00:10.000Z',
      'end-time': '2023-12-12T00:00:00.000Z',
      interval: 5,
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

  it('happy case.', async () => {
    const basicConfig = {
      'start-time': '2023-12-12T00:00:00.000Z',
      'end-time': '2023-12-12T00:00:10.000Z',
      interval: 1,
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
});
