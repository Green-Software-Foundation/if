import {ERRORS} from '@grnsft/if-core/utils';

import {Copy} from '../../../if-run/builtins/copy-param';

import {STRINGS} from '../../../if-run/config';

const {GlobalConfigError, InputValidationError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

describe('builtins/copy: ', () => {
  describe('Copy: ', () => {
    const config = {
      'keep-existing': true,
      from: 'original',
      to: 'copy',
    };
    const parametersMetadata = {
      inputs: {},
      outputs: {},
    };
    const copy = Copy(config, parametersMetadata);

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(copy).toHaveProperty('metadata');
        expect(copy).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('successfully applies Copy strategy to given input.', () => {
        expect.assertions(1);

        const expectedResult = [
          {
            duration: 3600,
            original: 'hello',
            copy: 'hello',
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = copy.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            original: 'hello',
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('throws an error when config is not provided.', () => {
        const config = undefined;
        const copy = Copy(config!, parametersMetadata);

        expect.assertions(1);

        try {
          copy.execute([
            {
              timestamp: '2021-01-01T00:00:00Z',
              duration: 3600,
              original: 1,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(new GlobalConfigError(MISSING_CONFIG));
        }
      });

      it('throws an error on missing params in input.', () => {
        const config = {
          'keep-existing': true,
          from: 'original',
          to: 'copy',
        };
        const copy = Copy(config, parametersMetadata);
        expect.assertions(1);

        try {
          copy.execute([
            {
              duration: 3600,
              timestamp: '2021-01-01T00:00:00Z',
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError(
              '"original" parameter is required. Error code: invalid_type.'
            )
          );
        }
      });
      it('does not persist the original value when keep-existing==false.', () => {
        expect.assertions(1);
        const config = {
          'keep-existing': false,
          from: 'original',
          to: 'copy',
        };
        const copy = Copy(config, parametersMetadata);

        const expectedResult = [
          {
            duration: 3600,
            copy: 'hello',
            timestamp: '2021-01-01T00:00:00Z',
          },
        ];

        const result = copy.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            original: 'hello',
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });
    });
  });
});
