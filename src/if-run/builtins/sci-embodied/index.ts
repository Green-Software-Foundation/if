import {z, ZodType} from 'zod';

import {
  evaluateInput,
  evaluateConfig,
  evaluateArithmeticOutput,
  validateArithmeticExpression,
} from '@grnsft/if-core/utils';
import {
  mapConfigIfNeeded,
  mapInputIfNeeded,
  mapOutputIfNeeded,
} from '@grnsft/if-core/utils/helpers';
import {
  ExecutePlugin,
  ConfigParams,
  ParameterMetadata,
  MappingParams,
  PluginParametersMetadata,
  PluginParams,
} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

export const SciEmbodied = (
  config: ConfigParams = {},
  parametersMetadata: PluginParametersMetadata,
  mapping: MappingParams
): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
    inputs: {
      ...({
        vCPUs: {
          description: 'number of CPUs allocated to an application',
          unit: 'CPUs',
          'aggregation-method': {
            time: 'copy',
            component: 'copy',
          },
        },
        memory: {
          description: 'RAM available for a resource, in GB',
          unit: 'GB',
          'aggregation-method': {
            time: 'copy',
            component: 'copy',
          },
        },
        ssd: {
          description: 'number of SSDs available for a resource',
          unit: 'SSDs',
          'aggregation-method': {
            time: 'copy',
            component: 'copy',
          },
        },
        hdd: {
          description: 'number of HDDs available for a resource',
          unit: 'HDDs',
          'aggregation-method': {
            time: 'copy',
            component: 'copy',
          },
        },
        gpu: {
          description: 'number of GPUs available for a resource',
          unit: 'GPUs',
          'aggregation-method': {
            time: 'copy',
            component: 'copy',
          },
        },
        'usage-ratio': {
          description:
            'a scaling factor that can be used to describe the ratio of actual resource usage comapred to real device usage, e.g. 0.25 if you are using 2 out of 8 vCPUs, 0.1 if you are responsible for 1 out of 10 GB of storage, etc',
          unit: 'dimensionless',
          'aggregation-method': {
            time: 'copy',
            component: 'copy',
          },
        },
        time: {
          description:
            'a time unit to scale the embodied carbon by, in seconds. If not provided,time defaults to the value of the timestep duration.',
          unit: 'seconds',
          'aggregation-method': {
            time: 'copy',
            component: 'copy',
          },
        },
      } as ParameterMetadata),
      ...parametersMetadata?.inputs,
    },
    outputs: parametersMetadata?.outputs || {
      'embodied-carbon': {
        description: 'embodied carbon for a resource, scaled by usage',
        unit: 'gCO2e',
        'aggregation-method': {
          time: 'sum',
          component: 'sum',
        },
      },
    },
  };

  /**
   * Checks for required fields in input.
   */
  const validateConfig = (input: PluginParams) => {
    const schema = z.object({
      'baseline-vcpus': z.preprocess(
        value => validateArithmeticExpression('baseline-vcpus', value),
        z.number().gte(0).default(1)
      ),
      'baseline-memory': z.preprocess(
        value => validateArithmeticExpression('baseline-memory', value),
        z.number().gte(0).default(16)
      ),
      'baseline-emissions': z.preprocess(
        value => validateArithmeticExpression('baseline-emissions', value),
        z.number().gte(0).default(1000000)
      ),
      lifespan: z.preprocess(
        value => validateArithmeticExpression('lifespan', value),
        z.number().gt(0).default(126144000)
      ),
      'vcpu-emissions-constant': z.preprocess(
        value => validateArithmeticExpression('vcpu-emissions-constant', value),
        z.number().gte(0).default(100000)
      ),
      'memory-emissions-constant': z.preprocess(
        value =>
          validateArithmeticExpression('memory-emissions-constant', value),
        z
          .number()
          .gte(0)
          .default(533 / 384)
      ),
      'ssd-emissions-constant': z.preprocess(
        value => validateArithmeticExpression('ssd-emissions-constant', value),
        z.number().gte(0).default(50000)
      ),
      'hdd-emissions-constant': z.preprocess(
        value => validateArithmeticExpression('hdd-emissions-constant', value),
        z.number().gte(0).default(100000)
      ),
      'gpu-emissions-constant': z.preprocess(
        value => validateArithmeticExpression('gpu-emissions-constant', value),
        z.number().gte(0).default(150000)
      ),
      'output-parameter': z.string().optional(),
    });

    const mappedConfig = mapConfigIfNeeded(config, mapping);
    const evaluatedConfig = evaluateConfig({
      config: mappedConfig,
      input,
      parametersToEvaluate: Object.keys(config).filter(
        key => key !== 'output-parameter'
      ),
    });

    return validate<z.infer<typeof schema>>(
      schema as ZodType<any>,
      evaluatedConfig
    );
  };

  /**
   * Validates single observation for safe calculation.
   */
  const validateInput = (input: PluginParams) => {
    const schema = z.object({
      duration: z.number().gt(0),
      vCPUs: z.number().gt(0).default(1),
      memory: z.number().gt(0).default(16),
      ssd: z.number().gte(0).default(0),
      hdd: z.number().gte(0).default(0),
      gpu: z.number().gte(0).default(0),
      'usage-ratio': z.number().gt(0).default(1),
      time: z.number().gt(0).optional(),
    });

    const evaluatedInput = evaluateInput(input);
    return validate<z.infer<typeof schema>>(
      schema as ZodType<any>,
      evaluatedInput
    );
  };

  /**
   * 1. Validates configuration and assigns defaults values if not provided.
   * 2. Maps through observations and validates them.
   * 3. Calculates total embodied carbon by substracting and the difference between baseline server and given one.
   */
  const execute = (inputs: PluginParams[]) => {
    return inputs.map(input => {
      const safeConfig = validateConfig(input);
      const mappedInput = mapInputIfNeeded(input, mapping);
      const safeInput = validateInput(mappedInput);

      const cpuE =
        (safeInput.vCPUs - safeConfig['baseline-vcpus']) *
        safeConfig['vcpu-emissions-constant'];
      const memoryE =
        (safeInput.memory - safeConfig['baseline-memory']) *
        ((safeConfig['memory-emissions-constant'] *
          safeConfig['baseline-memory']) /
          16) *
        1000;
      const hddE = safeInput.hdd * safeConfig['hdd-emissions-constant'];
      const gpuE = safeInput.gpu * safeConfig['gpu-emissions-constant'];
      const ssdE = safeInput.ssd * safeConfig['ssd-emissions-constant'];
      const time = safeInput['time'] || safeInput.duration;

      const totalEmbodied =
        safeConfig['baseline-emissions'] + cpuE + memoryE + ssdE + hddE + gpuE;

      const totalEmbodiedScaledByUsage =
        totalEmbodied * safeInput['usage-ratio'];

      const totalEmbodiedScaledByUsageAndTime =
        totalEmbodiedScaledByUsage * (time / safeConfig['lifespan']);

      const embodiedCarbonKey =
        safeConfig['output-parameter'] || 'embodied-carbon';

      const result = {
        ...input,
        ...evaluateArithmeticOutput(
          embodiedCarbonKey,
          totalEmbodiedScaledByUsageAndTime
        ),
      };

      return mapOutputIfNeeded(result, mapping);
    });
  };

  return {
    execute,
    metadata,
  };
};
