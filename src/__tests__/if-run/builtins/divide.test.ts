import {ERRORS} from '@grnsft/if-core/utils';

import {Divide} from '../../../if-run/builtins';

import {STRINGS} from '../../../if-run/config';

const {InputValidationError, ConfigError, MissingInputDataError} = ERRORS;
const {MISSING_CONFIG, MISSING_INPUT_DATA} = STRINGS;

describe('builtins/divide: ', () => {
  describe('Divide: ', () => {
    const config = {
      numerator: 'vcpus-allocated',
      denominator: 2,
      output: 'cpu/number-cores',
    };
    const parametersMetadata = {
      inputs: {},
      outputs: {},
    };
    const divide = Divide(config, parametersMetadata, {});

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

      it('successfully executes when `mapping` has valid data.', async () => {
        expect.assertions(1);
        const mapping = {
          'vcpus-allocated': 'vcpus-distributed',
        };

        const divide = Divide(config, parametersMetadata, mapping);

        const expectedResult = [
          {
            duration: 3600,
            'vcpus-distributed': 24,
            'cpu/number-cores': 12,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = await divide.execute([
          {
            duration: 3600,
            'vcpus-distributed': 24,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully executes when the `mapping` map output parameter.', async () => {
        expect.assertions(1);
        const mapping = {
          'cpu/number-cores': 'cpu-number-cores',
        };

        const divide = Divide(config, parametersMetadata, mapping);

        const expectedResult = [
          {
            duration: 3600,
            'vcpus-allocated': 24,
            'cpu-number-cores': 12,
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

      it('returns a result when `denominator` is provided in input.', async () => {
        expect.assertions(1);
        const config = {
          numerator: 'vcpus-allocated',
          denominator: 'duration',
          output: 'vcpus-allocated-per-second',
        };

        const divide = Divide(config, parametersMetadata, {});
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

      it('successfully executes when a parameter contains arithmetic expression.', () => {
        expect.assertions(1);

        const config = {
          numerator: '=3*"vcpus-allocated"',
          denominator: 'duration',
          output: 'vcpus-allocated-per-second',
        };

        const divide = Divide(config, parametersMetadata, {});
        const input = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'vcpus-allocated': 24,
          },
        ];
        const response = divide.execute(input);

        const expectedResult = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'vcpus-allocated': 24,
            'vcpus-allocated-per-second': 72 / 3600,
          },
        ];

        expect(response).toEqual(expectedResult);
      });

      it('throws an error the `numerator` parameter has wrong arithmetic expression.', () => {
        const config = {
          numerator: '3*"vcpus-allocated"',
          denominator: 'duration',
          output: 'vcpus-allocated-per-second',
        };

        const divide = Divide(config, parametersMetadata, {});
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'vcpus-allocated': 24,
          },
        ];
        expect.assertions(2);
        try {
          divide.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect(error).toEqual(
            new InputValidationError(
              'The `numerator` contains an invalid arithmetic expression. It should start with `=` and include the symbols `*`, `+`, `-` and `/`.'
            )
          );
        }
      });

      it('throws an error on missing params in input.', async () => {
        const expectedMessage =
          '"vcpus-allocated" parameter is required. Error code: invalid_type.';

        const config = {
          numerator: 'vcpus-allocated',
          denominator: 3600,
          output: 'vcpus-allocated-per-second',
        };

        const divide = Divide(config, parametersMetadata, {});

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

    it('throws an error on missing config.', async () => {
      const config = undefined;
      const divide = Divide(config!, parametersMetadata, {});

      expect.assertions(1);

      try {
        await divide.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
          },
        ]);
      } catch (error) {
        expect(error).toStrictEqual(new ConfigError(MISSING_CONFIG));
      }
    });

    it('throws an error when `denominator` is 0.', async () => {
      const config = {
        numerator: 'vcpus-allocated',
        denominator: 0,
        output: 'vcpus-allocated-per-second',
      };
      const divide = Divide(config, parametersMetadata, {});

      expect.assertions(1);

      const response = await divide.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          duration: 3600,
          'vcpus-allocated': 24,
        },
      ]);

      expect(response).toEqual([
        {
          timestamp: '2021-01-01T00:00:00Z',
          duration: 3600,
          'vcpus-allocated': 24,
          'vcpus-allocated-per-second': 24,
        },
      ]);
    });

    it('throws an error when `denominator` is string.', async () => {
      const config = {
        numerator: 'vcpus-allocated',
        denominator: '10',
        output: 'vcpus-allocated-per-second',
      };

      const divide = Divide(config, parametersMetadata, {});

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
          new MissingInputDataError(MISSING_INPUT_DATA(config.denominator))
        );
      }
    });
  });
});
