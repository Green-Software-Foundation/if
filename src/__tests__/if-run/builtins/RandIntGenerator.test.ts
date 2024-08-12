import {ERRORS} from '@grnsft/if-core/utils';

import {RandIntGenerator} from '../../../if-run/builtins/mock-observations/helpers/rand-int-generator';

import {STRINGS} from '../../../if-run/config';

const {GlobalConfigError} = ERRORS;
const {INVALID_NAME, MISSING_MIN_MAX, MISSING_CONFIG} = STRINGS;

describe('builtins/mock-observations/RandIntGenerator: ', () => {
  describe('initialize', () => {
    it('throws an error when the generator name is empty string.', async () => {
      expect.assertions(1);
      try {
        RandIntGenerator('', {});
      } catch (error) {
        expect(error).toEqual(new GlobalConfigError(INVALID_NAME));
      }
    });

    it('throws an error when config is empty object.', async () => {
      expect.assertions(1);
      try {
        RandIntGenerator('generator-name', {});
      } catch (error) {
        expect(error).toEqual(new GlobalConfigError(MISSING_CONFIG));
      }
    });

    it('throws an error `min` is missing from the config.', async () => {
      const config = {max: 90};

      expect.assertions(1);

      try {
        RandIntGenerator('random', config);
      } catch (error) {
        expect(error).toEqual(new GlobalConfigError(MISSING_MIN_MAX));
      }
    });
  });

  describe('next(): ', () => {
    it('returns a result with valid data.', async () => {
      const config: Record<string, any> = {
        min: 10,
        max: 90,
      };
      const randIntGenerator = RandIntGenerator('random', config);
      const result = randIntGenerator.next([]) as {random: number};

      expect.assertions(4);

      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty('random');
      expect(result.random).toBeGreaterThanOrEqual(10);
      expect(result.random).toBeLessThanOrEqual(90);
    });
  });
});
