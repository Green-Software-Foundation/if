import {describe, expect, it} from '@jest/globals';

import {parseProcessArgument} from './args';

import {STRINGS} from '../config';

const {WRONG_CLI_ARGUMENT} = STRINGS;

describe('util/args: ', () => {
  describe('parseProcessArgument(): ', () => {
    it('throws error if there is no argument passed.', () => {
      expect.assertions(2);

      try {
        parseProcessArgument();
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toEqual(WRONG_CLI_ARGUMENT);
        }
      }
    });
  });
});
