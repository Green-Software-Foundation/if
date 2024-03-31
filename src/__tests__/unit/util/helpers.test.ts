const mockWarn = jest.fn();
const mockError = jest.fn();

jest.mock('../../../util/logger', () => ({
  logger: {
    warn: mockWarn,
    error: mockError,
  },
}));
import {andHandle, mergeObjects} from '../../../util/helpers';
import {ERRORS} from '../../../util/errors';

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
    it('does not override input', () => {
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
});
