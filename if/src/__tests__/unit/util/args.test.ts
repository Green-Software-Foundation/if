import {validateOptions} from '../../../util/args';

import {ERRORS} from '../../../util/errors';

import {STRINGS} from '../../../config';

const {CliInputError} = ERRORS;

const {FILE_IS_NOT_YAML} = STRINGS;

describe('util/args: ', () => {
  describe('validateOptions(): ', () => {
    it('throws error if file is not yaml.', () => {
      expect.assertions(2);

      try {
        validateOptions('mock_impl.txt', undefined, undefined);
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(CliInputError);
          expect(error.message).toEqual(FILE_IS_NOT_YAML);
        }
      }
    });
  });
});
