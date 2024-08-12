import {ERRORS} from '@grnsft/if-core/utils';

import {Coefficient} from '../../../if-run/builtins/coefficient';

import {STRINGS} from '../../../if-run/config';

const {InputValidationError, GlobalConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

describe('builtins/coefficient: ', () => {
  describe('Coefficient: ', () => {
    const config = {
      'input-parameter': 'carbon',
      coefficient: 3,
      'output-parameter': 'carbon-product',
    };
    const parametersMetadata = {
      inputs: {},
      outputs: {},
    };
    const coefficient = Coefficient(config, parametersMetadata);

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(coefficient).toHaveProperty('metadata');
        expect(coefficient).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('successfully applies coefficient strategy to given input.', () => {
        expect.assertions(1);

        const expectedResult = [
          {
            duration: 3600,
            carbon: 3,
            'carbon-product': 9,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = coefficient.execute([
          {
            duration: 3600,
            carbon: 3,
            timestamp: '2021-01-01T00:00:00Z',
          },
        ]);

        expect.assertions(1);

        expect(result).toStrictEqual(expectedResult);
      });

      it('throws an error when config is not provided.', () => {
        const config = undefined;
        const coefficient = Coefficient(config!, parametersMetadata);

        expect.assertions(1);

        try {
          coefficient.execute([
            {
              duration: 3600,
              timestamp: '2021-01-01T00:00:00Z',
              carbon: 3,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(new GlobalConfigError(MISSING_CONFIG));
        }
      });

      it('throws an error on missing `input-parameter` param in input.', () => {
        const invalidConfig = {
          'input-parameter': '',
          coefficient: 3,
          'output-parameter': 'carbon-product',
        };
        const coefficient = Coefficient(invalidConfig, parametersMetadata);
        const expectedMessage =
          '"input-parameter" parameter is string must contain at least 1 character(s). Error code: too_small.';

        expect.assertions(1);

        try {
          coefficient.execute([
            {
              duration: 3600,
              timestamp: '2021-01-01T00:00:00Z',
              carbon: 3,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError(expectedMessage)
          );
        }
      });

      it('throws an error on missing `output-parameter` param in input.', () => {
        const invalidConfig = {
          'input-parameter': 'carbon',
          coefficient: 10,
          'output-parameter': '',
        };
        const coefficient = Coefficient(invalidConfig, parametersMetadata);
        const expectedMessage =
          '"output-parameter" parameter is string must contain at least 1 character(s). Error code: too_small.';

        expect.assertions(1);
        try {
          coefficient.execute([
            {
              duration: 3600,
              timestamp: '2021-01-01T00:00:00Z',
              carbon: 3,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError(expectedMessage)
          );
        }
      });
    });
  });
});
