import {KeyValuePair} from '../../../types/common';

import {ERRORS} from '../../../util/errors';

import {CommonGenerator} from '../../../builtins/mock-observations/helpers/common-generator';

const {InputValidationError} = ERRORS;

describe('lib/mock-observations/CommonGenerator: ', () => {
  describe('initialize: ', () => {
    it('throws an error when config is not empty object.', async () => {
      const commonGenerator = CommonGenerator({});

      expect.assertions(1);

      try {
        commonGenerator.next([]);
      } catch (error) {
        expect(error).toEqual(
          new InputValidationError(
            'CommonGenerator: Config must not be null or empty.'
          )
        );
      }
    });
  });

  describe('next(): ', () => {
    it('returns a result with valid data.', async () => {
      const config: KeyValuePair = {
        key1: 'value1',
        key2: 'value2',
      };
      const commonGenerator = CommonGenerator(config);

      expect.assertions(1);

      expect(commonGenerator.next([])).toStrictEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });
  });
});
