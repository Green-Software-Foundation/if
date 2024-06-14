import {ERRORS} from '@grnsft/if-core';

import {Exponent} from '../../../builtins/exponent';

import {STRINGS} from '../../../config';

const {InputValidationError, MissingInputDataError} = ERRORS;
const {NOT_NUMERIC_VALUE, MISSING_INPUT_DATA} = STRINGS;

describe('builtins/exponent: ', () => {
  describe('Exponent: ', () => {
    const globalConfig = {
      'input-parameter': 'energy/base',
      exponent: 3,
      'output-parameter': 'energy',
    };
    const exponent = Exponent(globalConfig);

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
            new MissingInputDataError(MISSING_INPUT_DATA('energy/base'))
          );
        }
      });

      it('throws an error on input param value not numeric.', async () => {
        expect.assertions(1);
        const input = [
          {
            duration: 3600,
            'energy/base': 'i-am-not-a-number',
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        try {
          await exponent.execute(input);
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError(NOT_NUMERIC_VALUE(input[0]['energy/base']))
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
        const exponent = Exponent(newConfig);

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
    });
  });
});
