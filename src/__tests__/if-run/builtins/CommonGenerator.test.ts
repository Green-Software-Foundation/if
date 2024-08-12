import {ERRORS} from '@grnsft/if-core/utils';

import {CommonGenerator} from '../../../if-run/builtins/mock-observations/helpers/common-generator';

import {STRINGS} from '../../../if-run/config';

const {GlobalConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

describe('builtins/mock-observations/CommonGenerator: ', () => {
  describe('initialize: ', () => {
    it('throws an error when config is not empty object.', async () => {
      const commonGenerator = CommonGenerator({});

      expect.assertions(1);

      try {
        commonGenerator.next([]);
      } catch (error) {
        expect(error).toEqual(new GlobalConfigError(MISSING_CONFIG));
      }
    });
  });

  describe('next(): ', () => {
    it('returns a result with valid data.', async () => {
      const config: Record<string, any> = {
        key1: 'value1',
        key2: 'value2',
      };
      const commonGenerator = CommonGenerator(config);

      expect.assertions(1);

      expect(commonGenerator.next([])).toEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });
  });
});
