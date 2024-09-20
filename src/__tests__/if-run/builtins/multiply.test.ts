import {ERRORS} from '@grnsft/if-core/utils';

import {Multiply} from '../../../if-run/builtins/multiply';
import {STRINGS} from '../../../if-run/config';

const {InputValidationError, ConfigError} = ERRORS;

const {MISSING_CONFIG} = STRINGS;

describe('builtins/multiply: ', () => {
  describe.skip('Multiply: ', () => {
    const config = {
      'input-parameters': ['cpu/energy', 'network/energy', 'memory/energy'],
      'output-parameter': 'energy',
    };
    const parametersMetadata = {
      inputs: {},
      outputs: {},
    };

    const multiply = Multiply(config, parametersMetadata, {});

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(multiply).toHaveProperty('metadata');
        expect(multiply).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('successfully applies Multiply strategy to given input.', async () => {
        expect.assertions(1);

        const expectedResult = [
          {
            duration: 3600,
            'cpu/energy': 2,
            'network/energy': 2,
            'memory/energy': 2,
            energy: 8,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = await multiply.execute([
          {
            duration: 3600,
            'cpu/energy': 2,
            'network/energy': 2,
            'memory/energy': 2,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully executes when `mapping` is provided.', async () => {
        expect.assertions(1);
        const mapping = {
          'cpu/energy': 'energy-from-cpu',
          'network/energy': 'energy-from-network',
          'memory/energy': 'energy-from-memory',
        };
        const config = {
          'input-parameters': ['cpu/energy', 'network/energy', 'memory/energy'],
          'output-parameter': 'energy',
        };
        const multiply = Multiply(config, parametersMetadata, mapping);

        const expectedResult = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'energy-from-cpu': 2,
            'energy-from-network': 2,
            'energy-from-memory': 2,
            energy: 8,
          },
        ];

        const result = await multiply.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'energy-from-cpu': 2,
            'energy-from-network': 2,
            'energy-from-memory': 2,
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully executes when the `mapping` maps output parameter.', async () => {
        expect.assertions(1);
        const mapping = {
          energy: 'total/energy',
        };
        const config = {
          'input-parameters': ['cpu/energy', 'network/energy', 'memory/energy'],
          'output-parameter': 'energy',
        };
        const multiply = Multiply(config, parametersMetadata, mapping);

        const expectedResult = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'cpu/energy': 2,
            'network/energy': 2,
            'memory/energy': 2,
            'total/energy': 8,
          },
        ];

        const result = await multiply.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'cpu/energy': 2,
            'network/energy': 2,
            'memory/energy': 2,
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('throws an error on missing params in input.', async () => {
        expect.assertions(1);

        try {
          await multiply.execute([
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
          'output-parameter': 'carbon-product',
        };
        const multiply = Multiply(newConfig, parametersMetadata, {});

        const data = [
          {
            duration: 3600,
            timestamp: '2021-01-01T00:00:00Z',
            carbon: 3,
            'other-carbon': 2,
          },
        ];
        const response = await multiply.execute(data);

        const expectedResult = [
          {
            duration: 3600,
            timestamp: '2021-01-01T00:00:00Z',
            carbon: 3,
            'other-carbon': 2,
            'carbon-product': 6,
          },
        ];

        expect(response).toEqual(expectedResult);
      });

      it('successfully executes when the config output parameter contains arithmetic expression.', () => {
        expect.assertions(1);

        const config = {
          'input-parameters': ['cpu/energy', 'network/energy', 'memory/energy'],
          'output-parameter': '=2*energy',
        };
        const multiply = Multiply(config, parametersMetadata, {});
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'cpu/energy': 2,
            'network/energy': 2,
            'memory/energy': 2,
          },
        ];
        const response = multiply.execute(inputs);

        const expectedResult = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'cpu/energy': 2,
            'network/energy': 2,
            'memory/energy': 2,
            energy: 16,
          },
        ];

        expect(response).toEqual(expectedResult);
      });

      it('throws an error the config output parameter has wrong arithmetic expression.', () => {
        const config = {
          'input-parameters': ['cpu/energy', 'network/energy', 'memory/energy'],
          'output-parameter': '2*energy',
        };

        const multiply = Multiply(config, parametersMetadata, {});
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'cpu/energy': 2,
            'network/energy': 2,
            'memory/energy': 2,
          },
        ];
        expect.assertions(2);
        try {
          multiply.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect(error).toEqual(
            new InputValidationError(
              'The `output-parameter` contains an invalid arithmetic expression. It should start with `=` and include the symbols `*`, `+`, `-` and `/`.'
            )
          );
        }
      });

      it('throws an error on missing config.', async () => {
        const config = undefined;
        const multiply = Multiply(config!, parametersMetadata, {});

        expect.assertions(1);

        try {
          await multiply.execute([
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
});
