const mockWarn = jest.fn();
const mockError = jest.fn();

jest.mock('node:readline/promises', () =>
  require('../../../__mocks__/readline')
);
jest.mock('../../../util/logger', () => ({
  logger: {
    warn: mockWarn,
    error: mockError,
  },
}));
import {ERRORS} from '@grnsft/if-core/utils';
import {
  andHandle,
  checkIfEqual,
  formatNotMatchingLog,
  mergeObjects,
  oneIsPrimitive,
  parseManifestFromStdin,
} from '../../../util/helpers';
import {Difference} from '../../../types/lib/compare';

const {WriteFileError} = ERRORS;

describe('util/helpers: ', () => {
  describe('andHandle(): ', () => {
    afterEach(() => {
      mockWarn.mockReset();
      mockError.mockReset();
    });

    it('logs error and warn in case of error is unknown.', () => {
      const message = 'mock-message';
      const MockError = class extends Error {};

      andHandle(new MockError(message));
      expect(mockWarn).toHaveBeenCalledTimes(1);
      expect(mockError).toHaveBeenCalledTimes(1);
    });

    it('logs error in case of error is unknown.', () => {
      const message = 'mock-message';

      andHandle(new WriteFileError(message));
      expect(mockWarn).toHaveBeenCalledTimes(0);
      expect(mockError).toHaveBeenCalledTimes(1);
    });
  });
});

describe('util/helpers: ', () => {
  describe('mergeObjects(): ', () => {
    it('does not override input.', () => {
      expect.assertions(1);

      const input = {
        a: 1,
        b: false,
        c: 'testInput',
      };

      const defaults = {
        c: 'testDefault',
      };
      const result = mergeObjects(defaults, input);

      expect(result).toEqual(input);
    });

    it('overrides null/undefined inputs.', () => {
      expect.assertions(1);

      const input = {
        a: 1,
        b: false,
        c: 'testInput',
        d: null,
        e: undefined,
      };

      const defaults = {
        c: 'testDefault',
        d: 'testDefault',
        e: 'testDefault',
      };
      const result = mergeObjects(defaults, input);
      const expectedResult = {
        a: 1,
        b: false,
        c: 'testInput',
        d: 'testDefault',
        e: 'testDefault',
      };

      expect(result).toEqual(expectedResult);
    });

    it('adds only properties missing in input.', () => {
      expect.assertions(1);

      const input = {
        a: 1,
        b: false,
        c: 'testInput',
      };

      const defaults = {
        b: true,
        c: 'testDefault',
        d: 25,
      };

      const result = mergeObjects(defaults, input);
      const expectedResult = {
        a: 1,
        b: false,
        c: 'testInput',
        d: 25,
      };

      expect(result).toEqual(expectedResult);
    });

    it('keeps values from input in case of nested objects.', () => {
      expect.assertions(1);

      const input = {
        a: 1,
        b: false,
        c: 'testInput',
        d: {
          e: 1,
        },
      };

      const defaults = {
        b: true,
        c: 'testDefault1',
        d: {
          e: 25,
          f: 'testDefault2',
        },
      };

      const result = mergeObjects(defaults, input);
      const expectedResult = {
        a: 1,
        b: false,
        c: 'testInput',
        d: {
          e: 1,
        },
      };

      expect(result).toEqual(expectedResult);
    });

    it('keeps value from input in case of arrays.', () => {
      expect.assertions(1);

      const input = {
        a: 1,
        b: false,
        c: 'testInput1',
        d: [1, 2, 3, 4],
        e: 'testInput2',
      };

      const defaults = {
        b: true,
        c: 'testDefault1',
        d: [5, 6, 7, 8, 9],
        e: [1, 2, 3],
      };

      const result = mergeObjects(defaults, input);
      const expectedResult = {
        a: 1,
        b: false,
        c: 'testInput1',
        d: [1, 2, 3, 4],
        e: 'testInput2',
      };

      expect(result).toEqual(expectedResult);
    });
  });

  describe('formatNotMatchingLog(): ', () => {
    const actualLogger = console.log;
    const mockLogger = jest.fn();
    console.log = mockLogger;

    beforeEach(() => {
      mockLogger.mockReset();
    });

    it('logs the message.', () => {
      const difference: Difference = {
        message: 'mock-message',
      };

      formatNotMatchingLog(difference);
      expect(mockLogger).toHaveBeenCalledTimes(1);
      expect(mockLogger).toHaveBeenCalledWith(difference.message);
    });

    it('logs message and path.', () => {
      const difference: Difference = {
        message: 'mock-message',
        path: 'mock.path',
      };

      formatNotMatchingLog(difference);
      expect(mockLogger).toHaveBeenCalledTimes(2);
      expect(mockLogger).toHaveBeenCalledWith(difference.message);
      expect(mockLogger).toHaveBeenCalledWith(difference.path);
    });

    it('logs message, path and formatted source/target (one is missing).', () => {
      const difference: Difference = {
        message: 'mock-message',
        path: 'mock.path',
        source: 'mock-source',
      };

      formatNotMatchingLog(difference);
      expect(mockLogger).toHaveBeenCalledTimes(4);
      expect(mockLogger).toHaveBeenCalledWith(difference.message);
      expect(mockLogger).toHaveBeenCalledWith(difference.path);
      expect(mockLogger).toHaveBeenCalledWith(`source: ${difference.source}`);
      expect(mockLogger).toHaveBeenCalledWith('target: missing');
    });

    it('logs message, path and formatted source/target.', () => {
      const difference: Difference = {
        message: 'mock-message',
        path: 'mock.path',
        source: 'mock-source',
        target: 'mock-target',
      };

      formatNotMatchingLog(difference);
      expect(mockLogger).toHaveBeenCalledTimes(4);
      expect(mockLogger).toHaveBeenCalledWith(difference.message);
      expect(mockLogger).toHaveBeenCalledWith(difference.path);
      expect(mockLogger).toHaveBeenCalledWith(`source: ${difference.source}`);
      expect(mockLogger).toHaveBeenCalledWith(`target: ${difference.target}`);
    });

    it('logs message, path and formatted source/target (numbers).', () => {
      const difference: Difference = {
        message: 'mock-message',
        path: 'mock.path',
        source: 10,
        target: 0,
      };

      formatNotMatchingLog(difference);
      expect(mockLogger).toHaveBeenCalledTimes(4);
      expect(mockLogger).toHaveBeenCalledWith(difference.message);
      expect(mockLogger).toHaveBeenCalledWith(difference.path);
      expect(mockLogger).toHaveBeenCalledWith(`source: ${difference.source}`);
      expect(mockLogger).toHaveBeenCalledWith(`target: ${difference.target}`);
    });

    it('logs message, path and formatted source/target (booleans).', () => {
      const difference: Difference = {
        message: 'mock-message',
        path: 'mock.path',
        source: true,
        target: false,
      };

      formatNotMatchingLog(difference);
      expect(mockLogger).toHaveBeenCalledTimes(4);
      expect(mockLogger).toHaveBeenCalledWith(difference.message);
      expect(mockLogger).toHaveBeenCalledWith(difference.path);
      expect(mockLogger).toHaveBeenCalledWith(`source: ${difference.source}`);
      expect(mockLogger).toHaveBeenCalledWith(`target: ${difference.target}`);
    });

    it('logs message, path and formatted source/target (objects).', () => {
      const difference: Difference = {
        message: 'mock-message',
        path: 'mock.path',
        source: {},
        target: false,
      };

      formatNotMatchingLog(difference);
      expect(mockLogger).toHaveBeenCalledTimes(4);
      expect(mockLogger).toHaveBeenCalledWith(difference.message);
      expect(mockLogger).toHaveBeenCalledWith(difference.path);
      expect(mockLogger).toHaveBeenCalledWith(`source: ${difference.source}`);
      expect(mockLogger).toHaveBeenCalledWith(`target: ${difference.target}`);
    });

    it('logs message, path and formatted source/target (empty string).', () => {
      const difference: Difference = {
        message: 'mock-message',
        path: 'mock.path',
        source: '',
        target: false,
      };

      formatNotMatchingLog(difference);
      expect(mockLogger).toHaveBeenCalledTimes(4);
      expect(mockLogger).toHaveBeenCalledWith(difference.message);
      expect(mockLogger).toHaveBeenCalledWith(difference.path);
      expect(mockLogger).toHaveBeenCalledWith(`source: ${difference.source}`);
      expect(mockLogger).toHaveBeenCalledWith(`target: ${difference.target}`);
    });

    afterAll(() => {
      console.log = actualLogger;
    });
  });

  describe('oneIsPrimitive(): ', () => {
    it('returns true if values are nullish.', () => {
      const source = null;
      const target = undefined;

      const result = oneIsPrimitive(source, target);
      expect(result).toBeTruthy();
    });

    it('returns true if values are string or number.', () => {
      const source = 'string';
      const target = 10;

      const result = oneIsPrimitive(source, target);
      expect(result).toBeTruthy();
    });

    it('returns false if one of values is object.', () => {
      const source = 'string';
      const target = {};

      const result = oneIsPrimitive(source, target);
      expect(result).toBeFalsy();
    });
  });

  describe('parseManifestFromStdin(): ', () => {
    it('returns empty string if there is no data in stdin.', async () => {
      const response = await parseManifestFromStdin();
      const expectedResult = '';

      expect(response).toEqual(expectedResult);
    });

    it('returns empty string if nothing is piped.', async () => {
      const originalIsTTY = process.stdin.isTTY;
      process.stdin.isTTY = true;
      const response = await parseManifestFromStdin();
      const expectedResult = '';

      expect(response).toEqual(expectedResult);
      process.stdin.isTTY = originalIsTTY;
    });

    it('throws error if there is no manifest in stdin.', async () => {
      process.env.readline = 'no_manifest';
      expect.assertions(1);

      const response = await parseManifestFromStdin();

      expect(response).toEqual('');
    });

    it('returns empty string if there is no data in stdin.', async () => {
      process.env.readline = 'manifest';
      const response = await parseManifestFromStdin();
      const expectedMessage = `
name: mock-name
description: mock-description
`;

      expect(response).toEqual(expectedMessage);
    });
  });

  describe('checkIfEqual(): ', () => {
    it('checks if values are equal.', () => {
      const a = 'mock';
      const b = 'mock';

      const response = checkIfEqual(a, b);
      expect(response).toBeTruthy();
    });

    it('returns true if one of the values is wildcard.', () => {
      const a = 'mock';
      const b = '*';

      const response = checkIfEqual(a, b);
      expect(response).toBeTruthy();
    });

    it('returns false for number and string with the same value.', () => {
      const a = 5;
      const b = '5';

      const response = checkIfEqual(a, b);
      expect(response).toBeFalsy();
    });
  });
});
