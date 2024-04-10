import {Logger} from 'winston';

import {Logger as LoggerUtil} from '../../../util/logger';

describe('util/logger: ', () => {
  describe('logger(): ', () => {
    it('is instance of winston logger.', () => {
      const localLogger = LoggerUtil('CLI');

      expect(localLogger).toBeInstanceOf(Logger);
    });
  });
});
