jest.mock('node:readline/promises', () =>
  require('../../../__mocks__/readline')
);

import {Difference} from '../../../if-diff/types/compare';
import {
  checkIfEqual,
  formatNotMatchingLog,
  oneIsPrimitive,
} from '../../../if-diff/util/helpers';

describe('if-diff/util/helpers: ', () => {
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
});
