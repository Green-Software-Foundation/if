import {ERRORS} from '@grnsft/if-core/utils';

import {Divide} from '../../../builtins';

import {STRINGS} from '../../../config';

const {InputValidationError, GlobalConfigError, MissingInputDataError} = ERRORS;
const {MISSING_GLOBAL_CONFIG, MISSING_INPUT_DATA} = STRINGS;

describe('builtins/divide: ', () => {
  describe('Divide: ', () => {
    const globalConfig = {
      numerator: 'vcpus-allocated',
      denominator: 2,
      output: 'cpu/number-cores',
    };
    const divide = Divide(globalConfig);

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(divide).toHaveProperty('metadata');
        expect(divide).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('successfully applies Divide strategy to given input.', async () => {
        expect.assertions(1);

        const expectedResult = [
          {
            duration: 3600,
            'vcpus-allocated': 24,
            'cpu/number-cores': 12,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = await divide.execute([
          {
            duration: 3600,
            'vcpus-allocated': 24,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('returns a result when `denominator` is provded in input.', async () => {
        expect.assertions(1);
        const globalConfig = {
          numerator: 'vcpus-allocated',
          denominator: 'duration',
          output: 'vcpus-allocated-per-second',
        };
        const divide = Divide(globalConfig);

        const input = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'vcpus-allocated': 24,
          },
        ];
        const response = await divide.execute(input);

        const expectedResult = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'vcpus-allocated': 24,
            'vcpus-allocated-per-second': 24 / 3600,
          },
        ];

        expect(response).toEqual(expectedResult);
      });

      it('throws an error on missing params in input.', async () => {
        const expectedMessage =
          '"vcpus-allocated" parameter is required. Error code: invalid_type.';

        const globalConfig = {
          numerator: 'vcpus-allocated',
          denominator: 3600,
          output: 'vcpus-allocated-per-second',
        };
        const divide = Divide(globalConfig);

        expect.assertions(1);

        try {
          await divide.execute([
            {
              timestamp: '2021-01-01T00:00:00Z',
              duration: 3600,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError(expectedMessage)
          );
        }
      });
    });

    it('throws an error on missing global config.', async () => {
      const config = undefined;
      const divide = Divide(config!);

      expect.assertions(1);

      try {
        await divide.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
          },
        ]);
      } catch (error) {
        expect(error).toStrictEqual(
          new GlobalConfigError(MISSING_GLOBAL_CONFIG)
        );
      }
    });

    it('throws an error when `denominator` is 0.', async () => {
      const expectedMessage =
        '"denominator" parameter is number must be greater than 0. Error code: too_small.';

      const globalConfig = {
        numerator: 'vcpus-allocated',
        denominator: 0,
        output: 'vcpus-allocated-per-second',
      };
      const divide = Divide(globalConfig);

      expect.assertions(1);

      try {
        await divide.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'vcpus-allocated': 24,
          },
        ]);
      } catch (error) {
        expect(error).toStrictEqual(new InputValidationError(expectedMessage));
      }
    });

    it('throws an error when `denominator` is string.', async () => {
      const globalConfig = {
        numerator: 'vcpus-allocated',
        denominator: '10',
        output: 'vcpus-allocated-per-second',
      };
      const divide = Divide(globalConfig);

      expect.assertions(1);

      try {
        await divide.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'vcpus-allocated': 24,
          },
        ]);
      } catch (error) {
        expect(error).toStrictEqual(
          new MissingInputDataError(
            MISSING_INPUT_DATA(globalConfig.denominator)
          )
        );
      }
    });
  });
});
