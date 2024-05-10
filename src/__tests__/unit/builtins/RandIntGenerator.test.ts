import {KeyValuePair} from '../../../types/common';

import {ERRORS} from '../../../util/errors';

import {RandIntGenerator} from '../../../builtins/mock-observations/helpers/rand-int-generator';

const {InputValidationError} = ERRORS;

describe('lib/mock-observations/RandIntGenerator: ', () => {
  describe('initialize', () => {
    it('throws an error when the generator name is empty string.', async () => {
      expect.assertions(1);
      try {
        RandIntGenerator('', {});
      } catch (error) {
        expect(error).toEqual(
          new InputValidationError(
            'RandIntGenerator: `name` is empty or all spaces.'
          )
        );
      }
    });

    it('throws an error when config is empty object.', async () => {
      expect.assertions(1);
      try {
        RandIntGenerator('generator-name', {});
      } catch (error) {
        expect(error).toEqual(
          new InputValidationError(
            'RandIntGenerator: Config must not be null or empty.'
          )
        );
      }
    });

    it('throws an error `min` is missing from the config.', async () => {
      const config = {max: 90};

      expect.assertions(1);

      try {
        RandIntGenerator('random', config);
      } catch (error) {
        expect(error).toEqual(
          new InputValidationError(
            'RandIntGenerator: Config is missing min or max.'
          )
        );
      }
    });
  });

  describe('next(): ', () => {
    it('returns a result with valid data.', async () => {
      const config: KeyValuePair = {
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
