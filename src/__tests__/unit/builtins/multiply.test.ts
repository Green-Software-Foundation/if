import {Multiply} from '../../../builtins/multiply';

import {ERRORS} from '../../../util/errors';
import {STRINGS} from '../../../config';

const {MissingInputDataError} = ERRORS;
const {MISSING_INPUT_DATA} = STRINGS;

describe('builtins/multiply: ', () => {
  describe('Multiply: ', () => {
    const globalConfig = {
      'input-parameters': ['cpu/energy', 'network/energy', 'memory/energy'],
      'output-parameter': 'energy',
    };
    const multiply = Multiply(globalConfig);

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
            new MissingInputDataError(MISSING_INPUT_DATA('cpu/energy'))
          );
        }
      });

      it('returns a result with input params not related to energy.', async () => {
        expect.assertions(1);
        const newConfig = {
          'input-parameters': ['carbon', 'other-carbon'],
          'output-parameter': 'carbon-product',
        };
        const multiply = Multiply(newConfig);

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
            carbon: 3,
            'other-carbon': 2,
            'carbon-product': 6,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        expect(response).toEqual(expectedResult);
      });
    });
  });
});
