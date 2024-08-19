import {ERRORS} from '@grnsft/if-core/utils';

import {Subtract} from '../../../if-run/builtins/subtract';

const {InputValidationError} = ERRORS;

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
        const globalConfig = {
          'input-parameters': ['cpu/energy', 'network/energy', 'memory/energy'],
          'output-parameter': 'energy/diff',
        };
        const subtract = Subtract(globalConfig, parametersMetadata, mapping);
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
  });
});
