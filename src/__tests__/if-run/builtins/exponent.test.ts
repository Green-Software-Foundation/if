import {ERRORS} from '@grnsft/if-core/utils';

import {STRINGS} from '../../../if-run/config';
import {Exponent} from '../../../if-run/builtins/exponent';

const {InputValidationError, ConfigError} = ERRORS;

const {MISSING_CONFIG} = STRINGS;

describe('builtins/exponent: ', () => {
  describe('Exponent: ', () => {
    const config = {
      'input-parameter': 'energy/base',
      exponent: 3,
      'output-parameter': 'energy',
    };
    const parametersMetadata = {
      inputs: {},
      outputs: {},
    };

    const exponent = Exponent(config, parametersMetadata, {});

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(exponent).toHaveProperty('metadata');
        expect(exponent).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('successfully applies Exponent strategy to given input.', async () => {
        expect.assertions(1);

        const expectedResult = [
          {
            duration: 3600,
            'energy/base': 2,
            energy: 8,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = await exponent.execute([
          {
            duration: 3600,
            'energy/base': 2,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully executes when `mapping` has valid data.', async () => {
        expect.assertions(1);
        const mapping = {
          'energy/base': 'energy/main',
        };
        const config = {
          'input-parameter': 'energy/base',
          exponent: 3,
          'output-parameter': 'energy',
        };
        const exponent = Exponent(config, parametersMetadata, mapping);
        const expectedResult = [
          {
            duration: 3600,
            'energy/main': 2,
            energy: 8,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = await exponent.execute([
          {
            duration: 3600,
            'energy/main': 2,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully executes when the `mapping` maps output parameter.', async () => {
        expect.assertions(1);

        const mapping = {
          energy: 'energy-result',
        };
        const config = {
          'input-parameter': 'energy/base',
          exponent: 3,
          'output-parameter': 'energy',
        };

        const exponent = Exponent(config, parametersMetadata, mapping);
        const expectedResult = [
          {
            duration: 3600,
            'energy/base': 2,
            'energy-result': 8,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = await exponent.execute([
          {
            duration: 3600,
            'energy/base': 2,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('throws an error on missing params in input.', async () => {
        expect.assertions(1);

        try {
          await exponent.execute([
            {
              duration: 3600,
              timestamp: '2021-01-01T00:00:00Z',
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError(
              '"energy/base" parameter is required. Error code: invalid_type.'
            )
          );
        }
      });

      it('throws an error on input param value not numeric.', async () => {
        expect.assertions(1);
        const inputs = [
          {
            duration: 3600,
            'energy/base': 'i-am-not-a-number',
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        try {
          await exponent.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError(
              '"energy/base" parameter is expected number, received string. Error code: invalid_type.'
            )
          );
        }
      });

      it('returns a result with input params not related to energy.', async () => {
        expect.assertions(1);
        const newConfig = {
          'input-parameter': 'carbon/base',
          exponent: 4,
          'output-parameter': 'carbon',
        };
        const exponent = Exponent(newConfig, parametersMetadata, {});

        const data = [
          {
            duration: 3600,
            timestamp: '2021-01-01T00:00:00Z',
            'carbon/base': 2,
          },
        ];
        const response = await exponent.execute(data);

        const expectedResult = [
          {
            duration: 3600,
            'carbon/base': 2,
            carbon: 16,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        expect(response).toEqual(expectedResult);
      });

      it('successfully executes when a parameter contains arithmetic expression.', async () => {
        const config = {
          'input-parameter': "=2*'energy/base'",
          exponent: 3,
          'output-parameter': 'energy',
        };
        const parametersMetadata = {
          inputs: {},
          outputs: {},
        };

        const exponent = Exponent(config, parametersMetadata, {});

        expect.assertions(1);

        const expectedResult = [
          {
            duration: 3600,
            'energy/base': 4,
            energy: 512,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = await exponent.execute([
          {
            duration: 3600,
            'energy/base': 4,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('throws an error when the `exponent` has wrong arithmetic expression.', async () => {
        const config = {
          'input-parameter': "=2*'energy/base'",
          exponent: "3*'mock-param'",
          'output-parameter': 'energy',
        };
        const parametersMetadata = {
          inputs: {},
          outputs: {},
        };

        const exponent = Exponent(config, parametersMetadata, {});

        expect.assertions(2);

        try {
          await exponent.execute([
            {
              duration: 3600,
              'energy/base': 4,
              timestamp: '2021-01-01T00:00:00Z',
            },
          ]);
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect(error).toEqual(
            new InputValidationError(
              'The `exponent` contains an invalid arithmetic expression. It should start with `=` and include the symbols `*`, `+`, `-` and `/`.'
            )
          );
        }
      });
    });

    it('throws an error on missing config.', async () => {
      const config = undefined;
      const exponent = Exponent(config!, parametersMetadata, {});

      expect.assertions(1);

      try {
        await exponent.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
          },
        ]);
      } catch (error) {
        expect(error).toStrictEqual(new ConfigError(MISSING_CONFIG));
      }
    });
  });
});
