import {ERRORS} from '@grnsft/if-core/utils';

import {Regex} from '../../../if-run/builtins/regex';

import {STRINGS} from '../../../if-run/config';

const {GlobalConfigError, MissingInputDataError, RegexMismatchError} = ERRORS;
const {MISSING_GLOBAL_CONFIG, MISSING_INPUT_DATA, REGEX_MISMATCH} = STRINGS;

describe('builtins/regex: ', () => {
  describe('Regex: ', () => {
    const globalConfig = {
      parameter: 'physical-processor',
      match: '^[^,]+',
      output: 'cpu/name',
    };
    const regex = Regex(globalConfig);

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(regex).toHaveProperty('metadata');
        expect(regex).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('successfully applies Regex strategy to given input.', async () => {
        const physicalProcessor =
          'Intel® Xeon® Platinum 8272CL,Intel® Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz,Intel® Xeon® E5-2673 v3 2.4 GHz';
        expect.assertions(1);

        const expectedResult = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'physical-processor': physicalProcessor,
            'cpu/name': 'Intel® Xeon® Platinum 8272CL',
          },
        ];

        const result = await regex.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'physical-processor': physicalProcessor,
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('returns a result when regex is not started and ended with ``.', async () => {
        const physicalProcessor =
          'Intel® Xeon® Platinum 8272CL,Intel® Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz,Intel® Xeon® E5-2673 v3 2.4 GHz';
        expect.assertions(1);

        const globalConfig = {
          parameter: 'physical-processor',
          match: '[^,]+/',
          output: 'cpu/name',
        };
        const regex = Regex(globalConfig);

        const expectedResult = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'physical-processor': physicalProcessor,
            'cpu/name': 'Intel® Xeon® Platinum 8272CL',
          },
        ];

        const result = await regex.execute([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'physical-processor': physicalProcessor,
          },
        ]);

        expect(result).toStrictEqual(expectedResult);
      });

      it('throws an error when `parameter` does not match to `match`.', async () => {
        const physicalProcessor =
          'Intel® Xeon® Platinum 8272CL,Intel® Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz,Intel® Xeon® E5-2673 v3 2.4 GHz';

        const globalConfig = {
          parameter: 'physical-processor',
          match: '^(^:)+',
          output: 'cpu/name',
        };
        const regex = Regex(globalConfig);

        expect.assertions(1);

        try {
          await regex.execute([
            {
              timestamp: '2021-01-01T00:00:00Z',
              duration: 3600,
              'physical-processor': physicalProcessor,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new RegexMismatchError(
              REGEX_MISMATCH(physicalProcessor, '/^(^:)+/')
            )
          );
        }
      });

      it('throws an error on missing global config.', async () => {
        const config = undefined;
        const regex = Regex(config!);

        expect.assertions(1);

        try {
          await regex.execute([
            {
              timestamp: '2021-01-01T00:00:00Z',
              duration: 3600,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new GlobalConfigError(MISSING_GLOBAL_CONFIG)
          );
        }
      });

      it('throws an error on missing params in input.', async () => {
        expect.assertions(1);

        try {
          await regex.execute([
            {
              timestamp: '2021-01-01T00:00:00Z',
              duration: 3600,
            },
          ]);
        } catch (error) {
          expect(error).toStrictEqual(
            new MissingInputDataError(MISSING_INPUT_DATA('physical-processor'))
          );
        }
      });
    });
  });
});
