import {TimeSync} from '../../../builtins/time-sync';
import {ERRORS} from '../../../util/errors';

import {STRINGS} from '../../../config';

const {InputValidationError} = ERRORS;

const {INVALID_OBSERVATION_OVERLAP} = STRINGS;

describe('lib/time-sync:', () => {
  describe('time-sync: ', () => {
    const basicConfig = {
      'start-time': '2023-12-12T00:01:00.000Z',
      'end-time': '2023-12-12T00:01:00.000Z',
      interval: 5,
      'allow-padding': true,
    };

    const timeSync = TimeSync(basicConfig);

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(timeSync).toHaveProperty('metadata');
        expect(timeSync).toHaveProperty('execute');
      });
    });
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

    const timeModel = TimeSync(invalidStartTimeConfig);

    expect.assertions(1);

    try {
      await timeModel.execute([
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 10,
          'cpu/utilizaition': 10,
        },
        {
          timestamp: '2023-12-12T00:00:10.000Z',
          duration: 30,
          'cpu/utilizaition': 20,
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
      '"end-time" parameter is invalid datetime. Error code: invalid_string.,`start-time` should be lower than `end-time`. Error code: custom.';
    const invalidEndTimeConfig = {
      'start-time': '2023-12-12T00:01:00.000Z',
      'end-time': '',
      interval: 5,
      'allow-padding': true,
    };
    const timeModel = TimeSync(invalidEndTimeConfig);

    expect.assertions(1);

    try {
      await timeModel.execute([
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 10,
          'cpu/utilizaition': 10,
        },
        {
          timestamp: '2023-12-12T00:00:10.000Z',
          duration: 30,
          'cpu/utilizaition': 20,
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
    const timeModel = TimeSync(invalidStartTimeConfig);
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
    const timeModel = TimeSync(invalidEndTimeConfig);

    expect.assertions(1);
    try {
      await timeModel.execute([
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 10,
          'cpu/utilizaition': 10,
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

  it('throws error if interval is invalid.', async () => {
    const invalidIntervalConfig = {
      'start-time': '2023-12-12T00:00:00.000Z',
      'end-time': '2023-12-12T00:01:00.000Z',
      interval: 0,
      'allow-padding': true,
    };

    const timeModel = TimeSync(invalidIntervalConfig);

    expect.assertions(1);

    try {
      await timeModel.execute([
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 15,
          'cpu/utilizaition': 10,
        },
        {
          timestamp: '2023-12-12T00:00:10.000Z',
          duration: 30,
          'cpu/utilizaition': 20,
        },
      ]);
    } catch (error) {
      expect(error).toStrictEqual(
        new InputValidationError(INVALID_OBSERVATION_OVERLAP)
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

    const timeModel = TimeSync(basicConfig);

    try {
      await timeModel.execute([
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 15,
          'cpu/utilizaition': 10,
        },
        {
          timestamp: '2023-12-12T00:00:10.000Z',
          duration: 30,
          'cpu/utilizaition': 20,
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
      'allow-padding': true,
    };

    const timeModel = TimeSync(basicConfig);

    try {
      await timeModel.execute([
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 15,
          'cpu/utilizaition': 10,
        },
        {
          timestamp: '2023-12-12T00:00:10.000Z',
          duration: 30,
          'cpu/utilizaition': 20,
        },
      ]);
    } catch (error) {
      expect(error).toStrictEqual(
        new InputValidationError(
          '`start-time` should be lower than `end-time`. Error code: custom.'
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

    const timeModel = TimeSync(basicConfig);

    const result = await timeModel.execute([
      {
        timestamp: '2023-12-12T00:00:00.000Z',
        duration: 1,
        'cpu/utilizaition': 10,
      },
      {
        timestamp: new Date('2023-12-12T00:00:01.000Z'),
        duration: 1,
        'cpu/utilizaition': 10,
      },
    ]);

    const expectedResult = [
      {
        timestamp: '2023-12-12T00:00:00.000Z',
        duration: 1,
        'cpu/utilizaition': 10,
      },
      {
        timestamp: '2023-12-12T00:00:01.000Z',
        duration: 1,
        'cpu/utilizaition': 10,
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

    const timeModel = TimeSync(basicConfig);

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

    const timeModel = TimeSync(basicConfig);

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

    /**In each 5 second interval, 60% of the time cpu/utilizaition = 10, 40% of the time it is 0, so cpu/utilizaition in the averaged result be 6 */
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

  it('throws error if padding is required at start while allow-padding = false.', async () => {
    const basicConfig = {
      'start-time': '2023-12-12T00:00:00.000Z',
      'end-time': '2023-12-12T00:00:10.000Z',
      interval: 5,
      'allow-padding': false,
    };

    const timeModel = TimeSync(basicConfig);

    try {
      await timeModel.execute([
        {
          timestamp: '2023-12-12T00:00:02.000Z',
          duration: 15,
          'cpu/utilizaition': 10,
        },
        {
          timestamp: '2023-12-12T00:00:10.000Z',
          duration: 30,
          'cpu/utilizaition': 20,
        },
      ]);
    } catch (error) {
      expect(error).toStrictEqual(
        new InputValidationError('Avoiding padding at start')
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

    const timeModel = TimeSync(basicConfig);

    try {
      await timeModel.execute([
        {
          timestamp: '2023-12-12T00:00:00.000Z',
          duration: 10,
          'cpu/utilizaition': 10,
        },
        {
          timestamp: '2023-12-12T00:00:10.000Z',
          duration: 30,
          'cpu/utilizaition': 20,
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

    const timeModel = TimeSync(basicConfig);

    try {
      await timeModel.execute([
        {
          timestamp: '2023-12-12T00:00:02.000Z',
          duration: 10,
          'cpu/utilizaition': 10,
        },
        {
          timestamp: '2023-12-12T00:00:08.000Z',
          duration: 1,
          'cpu/utilizaition': 20,
        },
      ]);
    } catch (error) {
      expect(error).toStrictEqual(
        new InputValidationError('Avoiding padding at start and end')
      );
    }
  });
});
