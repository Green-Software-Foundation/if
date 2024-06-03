import {Regex} from '../../../builtins/regex';

import {ERRORS} from '../../../util/errors';

const {InputValidationError, ConfigValidationError} = ERRORS;

describe('lib/regex: ', () => {
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
        const expectedMessage = `Regex: \`${physicalProcessor}\` does not match the /^(^:)+/ regex expression.`;

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
            new InputValidationError(expectedMessage)
          );
        }
      });

      it('throws an error on missing global config.', async () => {
        const expectedMessage = 'Regex: Configuration data is missing.';

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
            new ConfigValidationError(expectedMessage)
          );
        }
      });

      it('throws an error on missing params in input.', async () => {
        const expectedMessage =
          'Regex: `physical-processor` is missing from the input.';

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
            new InputValidationError(expectedMessage)
          );
        }
      });
    });
  });
});
