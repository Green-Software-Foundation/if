import {TimeSyncModel} from '../../../models';

import {ERRORS} from '../../../util/errors';

import {STRINGS} from '../../../config';

const {InputValidationError} = ERRORS;

const {INVALID_TIME_NORMALIZATION} = STRINGS;

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
      'start-time': '',
      'end-time': '2023-12-12T00:01:00.000Z',
      interval: 5,
    };
    const timeModel = await new TimeSyncModel().configure(invalidEndTimeConfig);

    try {
      timeModel.execute([
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
      expect(error).toEqual(
        new InputValidationError(INVALID_TIME_NORMALIZATION)
      );
    }
  });

  it('throws error if `interval` is missing.', async () => {
    const invalidIntervalConfig = {
      'start-time': '2023-12-12T00:00:00.000Z',
      'end-time': '2023-12-12T00:01:00.000Z',
      interval: 0,
    };
    const timeModel = await new TimeSyncModel().configure(
      invalidIntervalConfig
    );

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
        new InputValidationError('Interval is missing.')
      );
    }
  });
});
