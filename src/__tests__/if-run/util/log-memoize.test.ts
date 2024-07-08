import {LeveledLogMethod} from 'winston';

import {memoizedLog} from '../../../if-run/util/log-memoize';

describe('util/log-memoize: ', () => {
  describe('momoizedLog(): ', () => {
    it('should call logger.', () => {
      const message = 'mock-message';
      const logger = jest.fn(
        (message: string) => message
      ) as unknown as LeveledLogMethod;

      memoizedLog(logger, message);

      expect(logger).toHaveBeenCalledTimes(1);

      (logger as jest.Mock).mockReset();
    });

    it('wont call logger since its cached.', () => {
      const message = 'mock-message';
      const logger = jest.fn(
        (message: string) => message
      ) as unknown as LeveledLogMethod;

      memoizedLog(logger, message);
      memoizedLog(logger, message);

      expect(logger).toHaveBeenCalledTimes(0);
    });
  });
});
