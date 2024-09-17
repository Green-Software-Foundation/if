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

      it('successfully executes when a parameter contains arithmetic expression.', () => {
        const config = {
          'baseline-vcpus': 1,
          'baseline-memory': 16,
          lifespan: 157680000,
          'baseline-emissions': 2000000,
          'vcpu-emissions-constant': 100000,
          'memory-emissions-constant': 1172,
          'ssd-emissions-constant': 50000,
          'hdd-emissions-constant': 1 * 100000,
          'gpu-emissions-constant': '= 2 * "mock-param"',
          'output-parameter': 'embodied-carbon',
        };
        const sciEmbodied = SciEmbodied(config, parametersMetadata, {});
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            vCPUs: 2,
            'mock-param': 150000,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            vCPUs: 4,
            'mock-param': 100000,
          },
        ];

        const result = sciEmbodied.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            vCPUs: 2,
            'embodied-carbon': 47.945205479452056,
            'mock-param': 150000,
          },
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            vCPUs: 4,
            'embodied-carbon': 52.51141552511416,
            'mock-param': 100000,
          },
        ]);
      });

      it('throws an error the `gpu-emissions-constant` parameter has wrong arithmetic expression.', () => {
        const config = {
          'baseline-vcpus': 1,
          'baseline-memory': 16,
          lifespan: 157680000,
          'baseline-emissions': 2000000,
          'vcpu-emissions-constant': 100000,
          'memory-emissions-constant': 1172,
          'ssd-emissions-constant': 50000,
          'hdd-emissions-constant': 1 * 100000,
          'gpu-emissions-constant': '2 * "mock-param"',
          'output-parameter': 'embodied-carbon',
        };
        const sciEmbodied = SciEmbodied(config, parametersMetadata, {});
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 3600,
            vCPUs: 2,
            'mock-param': 150000,
          },
        ];

        expect.assertions(2);

        try {
          sciEmbodied.execute(inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect(error).toEqual(
            new InputValidationError(
              'The `gpu-emissions-constant` contains an invalid arithmetic expression. It should start with `=` and include the symbols `*`, `+`, `-` and `/`.'
            )
          );
        }
      });
    });
  });
});
