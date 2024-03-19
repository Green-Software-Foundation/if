const mockWarn = jest.fn();
const mockError = jest.fn();

jest.mock('../../../util/logger', () => ({
  logger: {
    warn: mockWarn,
    error: mockError,
  },
}));

import {andHandle} from '../../../util/helpers';
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
