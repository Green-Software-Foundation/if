import {ERRORS} from '@grnsft/if-core/utils';

import {Subtract} from '../../../if-run/builtins/subtract';

import {STRINGS} from '../../../if-run/config';

const {InputValidationError, ConfigError, WrongArithmeticExpressionError} =
  ERRORS;

const {MISSING_CONFIG} = STRINGS;

describe('builtins/subtract: ', () => {
  describe('Subtract: ', () => {
    const config = {
      'input-parameters': ['cpu/energy', 'network/energy', 'memory/energy'],
      'output-parameter': 'energy/diff',
    };
    const parametersMetadata = {
      inputs: {},
      outputs: {},
    };
    const subtract = Subtract(config, parametersMetadata, {});

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(subtract).toHaveProperty('metadata');
        expect(subtract).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('successfully applies Subtract strategy to given input.', async () => {
        expect.assertions(1);

        const expectedResult = [
          {
            duration: 3600,
            'cpu/energy': 4,
            'network/energy': 2,
            'memory/energy': 1,
            'energy/diff': 1,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = await subtract.execute([
          {
            duration: 3600,
            'cpu/energy': 4,
            'network/energy': 2,
            'memory/energy': 1,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully executes when `mapping` is provided.', async () => {
        const mapping = {
          'cpu/energy': 'energy-for-cpu',
        };
        const config = {
          'input-parameters': ['cpu/energy', 'network/energy', 'memory/energy'],
          'output-parameter': 'energy/diff',
        };
        const subtract = Subtract(config, parametersMetadata, mapping);
        expect.assertions(1);

        const expectedResult = [
          {
            duration: 3600,
            'energy-for-cpu': 4,
            'network/energy': 2,
            'memory/energy': 1,
            'energy/diff': 1,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = await subtract.execute([
          {
            duration: 3600,
            'energy-for-cpu': 4,
            'network/energy': 2,
            'memory/energy': 1,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully executes when the `mapping` maps output parameter.', async () => {
        const mapping = {
          'energy/diff': 'diff/energy',
        };
        const config = {
          'input-parameters': ['cpu/energy', 'network/energy', 'memory/energy'],
          'output-parameter': 'energy/diff',
        };
        const subtract = Subtract(config, parametersMetadata, mapping);
        expect.assertions(1);

        const expectedResult = [
          {
            duration: 3600,
            'cpu/energy': 4,
            'network/energy': 2,
            'memory/energy': 1,
            'diff/energy': 1,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = await subtract.execute([
          {
            duration: 3600,
            'cpu/energy': 4,
            'network/energy': 2,
            'memory/energy': 1,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('throws an error on missing params in input.', async () => {
        expect.assertions(1);

        try {
          await subtract.execute([
            {
              duration: 3600,
              timestamp: '2021-01-01T00:00:00Z',
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError(
              '"cpu/energy" parameter is required. Error code: invalid_type.,"network/energy" parameter is required. Error code: invalid_type.,"memory/energy" parameter is required. Error code: invalid_type.'
            )
          );
        }
      });

      it('returns a result with input params not related to energy.', async () => {
        expect.assertions(1);
        const newConfig = {
          'input-parameters': ['carbon', 'other-carbon'],
          'output-parameter': 'carbon-diff',
        };
        const subtract = Subtract(newConfig, parametersMetadata, {});

        const data = [
          {
            duration: 3600,
            timestamp: '2021-01-01T00:00:00Z',
            carbon: 3,
            'other-carbon': 2,
          },
        ];
        const response = await subtract.execute(data);

        const expectedResult = [
          {
            duration: 3600,
            carbon: 3,
            'other-carbon': 2,
            'carbon-diff': 1,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        expect(response).toEqual(expectedResult);
      });
    });

    it('successfully executes when the config output parameter contains an arithmetic expression.', async () => {
      expect.assertions(1);

      const config = {
        'input-parameters': ['cpu/energy', 'network/energy', 'memory/energy'],
        'output-parameter': "= 2 * 'energy/diff'",
      };
      const subtract = Subtract(config, parametersMetadata, {});

      const expectedResult = [
        {
          duration: 3600,
          'cpu/energy': 4,
          'network/energy': 2,
          'memory/energy': 1,
          'energy/diff': 2,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ];

      const result = await subtract.execute([
        {
          duration: 3600,
          'cpu/energy': 4,
          'network/energy': 2,
          'memory/energy': 1,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ]);

      expect(result).toStrictEqual(expectedResult);
    });

    it('throws an error the config output parameter has wrong arithmetic expression.', async () => {
      expect.assertions(2);

      const config = {
        'input-parameters': ['cpu/energy', 'network/energy', 'memory/energy'],
        'output-parameter': "=2 & 'energy/diff'",
      };
      const subtract = Subtract(config, parametersMetadata, {});

      const inputs = [
        {
          duration: 3600,
          'cpu/energy': 4,
          'network/energy': 2,
          'memory/energy': 1,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ];

      try {
        await subtract.execute(inputs);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toEqual(
          new WrongArithmeticExpressionError(
            "The output parameter `=2 & 'energy/diff'` contains an invalid arithmetic expression. It should start with `=` and include the symbols `*`, `+`, `-` and `/`."
          )
        );
      }
    });

    it('throws an error on missing config.', async () => {
      const config = undefined;
      const subtract = Subtract(config!, parametersMetadata, {});

      expect.assertions(1);

      try {
        await subtract.execute([
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
