import {TimeSyncModel} from '../../../models';
import {ERRORS} from '../../../util/errors';
import {STRINGS} from '../../../config';

const {InputValidationError} = ERRORS;

const {
  INVALID_TIME_NORMALIZATION,
  // INVALID_TIME_INTERVAL,
  // INVALID_OBSERVATION_OVERLAP,
} = STRINGS;

describe('models/time-sync: ', () => {
  describe('initialize time model', () => {
    it('initializes object with required properties.', () => {
      const timeModel = new TimeSyncModel();
      expect(timeModel).toHaveProperty('configure');
      expect(timeModel).toHaveProperty('execute');
    });
  });
});

describe('configure time model', () => {
  it('configures object with required properties.', () => {
    const timeModel = new TimeSyncModel();
    expect(
      typeof timeModel.configure({
        'start-time': '2023-12-12T00:00:00.000Z',
        'end-time': '2023-12-12T00:01:00.000Z',
        interval: 5,
      })
    ).toBe('object');
    expect(timeModel.startTime).toEqual('2023-12-12T00:00:00.000Z');
    expect(timeModel.endTime).toEqual('2023-12-12T00:01:00.000Z');
    expect(timeModel.interval).toEqual(5);
  });
});

describe('input validation', () => {
  it('throws if start time is missing.', async () => {
    const timeModel = new TimeSyncModel();
    timeModel.configure({
      'start-time': '',
      'end-time': '2023-12-12T00:01:00.000Z',
      interval: 5,
    });
    await expect(
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
      ])
    ).rejects.toStrictEqual(
      new InputValidationError(INVALID_TIME_NORMALIZATION)
    );
  });
  it('throws if end time is missing.', async () => {
    const timeModel = new TimeSyncModel();
    timeModel.configure({
      'start-time': '2023-12-12T00:00:00.000Z',
      'end-time': '',
      interval: 5,
    });
    await expect(
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
      ])
    ).rejects.toStrictEqual(
      new InputValidationError(INVALID_TIME_NORMALIZATION)
    );
  });
  it('throws if interval is missing.', async () => {
    const timeModel = new TimeSyncModel();
    timeModel.configure({
      'start-time': '2023-12-12T00:00:00.000Z',
      'end-time': '2023-12-12T00:01:00.000Z',
      interval: 0,
    });
    await expect(
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
      ])
    ).rejects.toStrictEqual(new InputValidationError('Interval is missing.'));
  });
});
