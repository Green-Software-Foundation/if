import {SciEmbodied} from '../../../builtins/sci-embodied';
import {ERRORS} from '../../../util/errors';

const {InputValidationError} = ERRORS;

describe('lib/sci-embodied:', () => {
  describe('SciEmbodied: ', () => {
    const sciEmbodied = SciEmbodied();

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(sciEmbodied).toHaveProperty('metadata');
        expect(sciEmbodied).toHaveProperty('execute');
      });
    });

    describe('execute():', () => {
      it('returns a result with valid inputs.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'device/emissions-embodied': 200,
            'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'resources-reserved': 1,
            'resources-total': 1,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30 * 2,
            'device/emissions-embodied': 200,
            'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'resources-reserved': 1,
            'resources-total': 1,
          },
        ];

        const result = await sciEmbodied.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'device/emissions-embodied': 200,
            'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'resources-reserved': 1,
            'resources-total': 1,
            'carbon-embodied': 4.10958904109589,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30 * 2,
            'device/emissions-embodied': 200,
            'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'resources-reserved': 1,
            'resources-total': 1,
            'carbon-embodied': 4.10958904109589 * 2,
          },
        ]);
      });

      it('returns a result when `vcpus-allocated` and `vcpus-total` are in the input.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'device/emissions-embodied': 200,
            'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'vcpus-allocated': 1,
            'vcpus-total': 1,
          },
        ];

        const result = await sciEmbodied.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'device/emissions-embodied': 200,
            'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'vcpus-allocated': 1,
            'vcpus-total': 1,
            'carbon-embodied': 4.10958904109589,
          },
        ]);
      });

      it('returns a result when `vcpus-allocated` and `vcpus-total` are preferred to `resources-reserved` and `resources-total`.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'device/emissions-embodied': 200,
            'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'resources-reserved': 2,
            'resources-total': 2,
            'vcpus-allocated': 1,
            'vcpus-total': 1,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30 * 2,
            'device/emissions-embodied': 200,
            'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'vcpus-allocated': 1,
            'vcpus-total': 1,
            'resources-reserved': 2,
            'resources-total': 2,
          },
        ];

        const result = await sciEmbodied.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'device/emissions-embodied': 200,
            'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'vcpus-allocated': 1,
            'vcpus-total': 1,
            'carbon-embodied': 4.10958904109589,
            'resources-reserved': 2,
            'resources-total': 2,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30 * 2,
            'device/emissions-embodied': 200,
            'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'vcpus-allocated': 1,
            'vcpus-total': 1,
            'carbon-embodied': 4.10958904109589 * 2,
            'resources-reserved': 2,
            'resources-total': 2,
          },
        ]);
      });

      it('returns a result when `vcpus-allocated` and `vcpus-total` are miised.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'device/emissions-embodied': 200,
            'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'resources-reserved': 1,
            'resources-total': 1,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30 * 2,
            'device/emissions-embodied': 200,
            'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'resources-reserved': 1,
            'resources-total': 1,
          },
        ];

        const result = await sciEmbodied.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'device/emissions-embodied': 200,
            'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'carbon-embodied': 4.10958904109589,
            'resources-reserved': 1,
            'resources-total': 1,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30 * 2,
            'device/emissions-embodied': 200,
            'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'carbon-embodied': 4.10958904109589 * 2,
            'resources-reserved': 1,
            'resources-total': 1,
          },
        ]);
      });

      it('throws an error when `device/emissions-embodied` is string.', async () => {
        const errorMessage =
          '"device/emissions-embodied" parameter is not a valid number in input. please provide it as `gco2e`. Error code: invalid_union.';
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'device/emissions-embodied': '10,00',
            'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'resources-reserved': 1,
            'resources-total': 1,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30 * 2,
            'device/emissions-embodied': 200,
            'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'resources-reserved': 1,
            'resources-total': 1,
          },
        ];

        expect.assertions(2);
        try {
          await sciEmbodied.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new InputValidationError(errorMessage));
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('throws an exception on missing `device/emissions-embodied`.', async () => {
        const errorMessage =
          '"device/emissions-embodied" parameter is required. Error code: invalid_union.';
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'device/expected-lifespan': 60 * 60 * 24 * 365 * 4,
            'vcpus-allocated': 1,
            'vcpus-total': 1,
          },
        ];

        expect.assertions(2);

        try {
          await sciEmbodied.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new InputValidationError(errorMessage));
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('throws an exception on missing `device/expected-lifespan`.', async () => {
        const errorMessage =
          '"device/expected-lifespan" parameter is required. Error code: invalid_union.';
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'device/emissions-embodied': 200,
            'vcpus-allocated': 1,
            'vcpus-total': 1,
          },
        ];

        expect.assertions(2);

        try {
          await sciEmbodied.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new InputValidationError(errorMessage));
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('throws an exception on invalid values.', async () => {
        const errorMessage =
          '"device/emissions-embodied" parameter is not a valid number in input. please provide it as `gco2e`. Error code: invalid_union.';
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            'device/emissions-embodied': '200',
            'vcpus-allocated': true,
            'vcpus-total': 1,
          },
        ];

        expect.assertions(2);

        try {
          await sciEmbodied.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new InputValidationError(errorMessage));
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });
    });
  });
});
