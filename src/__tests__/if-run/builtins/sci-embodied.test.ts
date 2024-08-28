import {ERRORS} from '@grnsft/if-core/utils';

import {SciEmbodied} from '../../../if-run/builtins/sci-embodied';

const {InputValidationError} = ERRORS;

describe('builtins/sci-embodied:', () => {
  describe('SciEmbodied: ', () => {
    const parametersMetadata = {
      inputs: {},
      outputs: {},
    };
    const sciEmbodied = SciEmbodied({}, parametersMetadata, {});

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
            duration: 3600,
            vCPUs: 2,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            vCPUs: 4,
          },
        ];

        const result = await sciEmbodied.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            vCPUs: 2,
            'embodied-carbon': 31.39269406392694,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            vCPUs: 4,
            'embodied-carbon': 37.10045662100457,
          },
        ]);
      });

      it('executes when `mapping` has valid data.', async () => {
        const mapping = {
          vCPUs: 'device/cpu-cores',
        };
        const sciEmbodied = SciEmbodied({}, parametersMetadata, mapping);
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'device/cpu-cores': 2,
          },
        ];

        const result = await sciEmbodied.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'embodied-carbon': 28.538812785388128,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'device/cpu-cores': 2,
            'embodied-carbon': 31.39269406392694,
          },
        ]);
      });

      it('executes when the `mapping` maps output parameter.', async () => {
        const mapping = {
          'embodied-carbon': 'carbon',
        };
        const sciEmbodied = SciEmbodied({}, parametersMetadata, mapping);
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'device/cpu-cores': 2,
          },
        ];

        const result = await sciEmbodied.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            carbon: 28.538812785388128,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            'device/cpu-cores': 2,
            carbon: 28.538812785388128,
          },
        ]);
      });

      it('throws an error when `vCPUs` is string.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30,
            vCPUs: 'string',
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 60 * 60 * 24 * 30 * 2,
            vCPUs: 'string',
          },
        ];

        expect.assertions(2);
        try {
          await sciEmbodied.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(
            new InputValidationError(
              '"vCPUs" parameter is expected number, received string. Error code: invalid_type.'
            )
          );
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });
    });
  });
});
