import {ERRORS} from '@grnsft/if-core/utils';

import {Sum} from '../../../if-run/builtins/sum';

const {InputValidationError, WrongArithmeticExpressionError} = ERRORS;

describe('builtins/sum: ', () => {
  describe('Sum: ', () => {
    const config = {
      'input-parameters': ['cpu/energy', 'network/energy', 'memory/energy'],
      'output-parameter': 'energy',
    };
    const parametersMetadata = {
      inputs: {},
      outputs: {},
    };
    const sum = Sum(config, parametersMetadata, {});

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(sum).toHaveProperty('metadata');
        expect(sum).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('successfully applies Sum strategy to given input.', async () => {
        expect.assertions(1);

        const expectedResult = [
          {
            duration: 3600,
            'cpu/energy': 1,
            'network/energy': 1,
            'memory/energy': 1,
            energy: 3,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = await sum.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'cpu/energy': 1,
            'network/energy': 1,
            'memory/energy': 1,
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully executes when `mapping` has valid data.', async () => {
        expect.assertions(1);

        const mapping = {
          'cpu/energy': 'energy-from-cpu',
          'network/energy': 'energy-from-network',
        };
        const config = {
          'input-parameters': ['cpu/energy', 'network/energy', 'memory/energy'],
          'output-parameter': 'energy',
        };

        const sum = Sum(config, parametersMetadata, mapping);

        const expectedResult = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'energy-from-cpu': 1,
            'energy-from-network': 1,
            'memory/energy': 1,
            energy: 3,
          },
        ];

        const result = await sum.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'energy-from-cpu': 1,
            'energy-from-network': 1,
            'memory/energy': 1,
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

        const sum = Sum(config, parametersMetadata, mapping);

        const expectedResult = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'cpu/energy': 1,
            'network/energy': 1,
            'memory/energy': 1,
            'total/energy': 3,
          },
        ];

        const result = await sum.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'cpu/energy': 1,
            'network/energy': 1,
            'memory/energy': 1,
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('throws an error when config is not provided.', async () => {
        const config = undefined;
        const sum = Sum(config!, parametersMetadata, {});

        expect.assertions(1);

        try {
          await sum.execute([
            {
              timestamp: '2021-01-01T00:00:00Z',
              duration: 3600,
              'cpu/energy': 1,
              'network/energy': 1,
              'memory/energy': 1,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError(
              '"input-parameters" parameter is required. Error code: invalid_type.,"output-parameter" parameter is required. Error code: invalid_type.'
            )
          );
        }
      });

      it('throws an error on missing params in input.', async () => {
        expect.assertions(1);

        try {
          await sum.execute([
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
          'output-parameter': 'carbon-sum',
        };
        const sum = Sum(newConfig, parametersMetadata, {});

        const data = [
          {
            duration: 3600,
            timestamp: '2021-01-01T00:00:00Z',
            carbon: 1,
            'other-carbon': 2,
          },
        ];
        const response = await sum.execute(data);

        const expectedResult = [
          {
            duration: 3600,
            carbon: 1,
            'other-carbon': 2,
            'carbon-sum': 3,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        expect(response).toEqual(expectedResult);
      });

      it('successfully executes when the config output parameter contains an arithmetic expression.', async () => {
        expect.assertions(1);

        const config = {
          'input-parameters': ['cpu/energy', 'network/energy', 'memory/energy'],
          'output-parameter': "=2*'energy'",
        };

        const sum = Sum(config, parametersMetadata, {});
        const expectedResult = [
          {
            duration: 3600,
            'cpu/energy': 1,
            'network/energy': 1,
            'memory/energy': 1,
            energy: 6,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = await sum.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'cpu/energy': 1,
            'network/energy': 1,
            'memory/energy': 1,
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('throws an error the config output parameter has wrong arithmetic expression.', async () => {
        expect.assertions(2);

        const config = {
          'input-parameters': ['cpu/energy', 'network/energy', 'memory/energy'],
          'output-parameter': "2*'energy'",
        };

        const sum = Sum(config, parametersMetadata, {});

        try {
          await sum.execute([
            {
              timestamp: '2021-01-01T00:00:00Z',
              duration: 3600,
              'cpu/energy': 1,
              'network/energy': 1,
              'memory/energy': 1,
            },
          ]);
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect(error).toEqual(
            new WrongArithmeticExpressionError(
              `The output parameter \`${config['output-parameter']}\` contains an invalid arithmetic expression. It should start with \`=\` and include the symbols \`*\`, \`+\`, \`-\` and \`/\`.`
            )
          );
        }
      });
    });
  });
});
