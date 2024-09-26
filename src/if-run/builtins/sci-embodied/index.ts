import {z} from 'zod';

import {ConfigParams, PluginParams} from '@grnsft/if-core/types';
import {PluginFactory} from '@grnsft/if-core/interfaces';

export const SciEmbodied = PluginFactory({
  metadata: {
    inputs: {
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
    },
    outputs: {
      'embodied-carbon': {
        description: 'embodied carbon for a resource, scaled by usage',
        unit: 'gCO2e',
        'aggregation-method': {
          time: 'sum',
          component: 'sum',
        },
      },
    },
  },
  configValidation: z.object({
    'baseline-vcpus': z.number().gte(0).default(1),
    'baseline-memory': z.number().gte(0).default(16),
    'baseline-emissions': z.number().gte(0).default(1000000),
    lifespan: z.number().gt(0).default(126144000),
    'vcpu-emissions-constant': z.number().gte(0).default(100000),
    'memory-emissions-constant': z
      .number()
      .gte(0)
      .default(533 / 384),
    'ssd-emissions-constant': z.number().gte(0).default(50000),
    'hdd-emissions-constant': z.number().gte(0).default(100000),
    'gpu-emissions-constant': z.number().gte(0).default(150000),
    'output-parameter': z.string().optional(),
  }),
  inputValidation: z.object({
    duration: z.number().gt(0),
    vCPUs: z.number().gt(0).default(1),
    memory: z.number().gt(0).default(16),
    ssd: z.number().gte(0).default(0),
    hdd: z.number().gte(0).default(0),
    gpu: z.number().gte(0).default(0),
    'usage-ratio': z.number().gt(0).default(1),
    time: z.number().gt(0).optional(),
  }),
  implementation: async (inputs: PluginParams[], config: ConfigParams) => {
    /**
     * 1. Validates configuration and assigns defaults values if not provided.
     * 2. Maps through observations and validates them.
     * 3. Calculates total embodied carbon by substracting and the difference between baseline server and given one.
     */
    return inputs.map(input => {
      const cpuE =
        (input.vCPUs - config['baseline-vcpus']) *
        config['vcpu-emissions-constant'];
      const memoryE =
        (input.memory - config['baseline-memory']) *
        ((config['memory-emissions-constant'] * config['baseline-memory']) /
          16) *
        1000;
      const hddE = input.hdd * config['hdd-emissions-constant'];
      const gpuE = input.gpu * config['gpu-emissions-constant'];
      const ssdE = input.ssd * config['ssd-emissions-constant'];
      const time = input['time'] || input.duration;

      const totalEmbodied =
        config['baseline-emissions'] + cpuE + memoryE + ssdE + hddE + gpuE;

      const totalEmbodiedScaledByUsage = totalEmbodied * input['usage-ratio'];

      const totalEmbodiedScaledByUsageAndTime =
        totalEmbodiedScaledByUsage * (time / config['lifespan']);

      const embodiedCarbonKey = config['output-parameter'] || 'embodied-carbon';

      return {
        ...input,
        [embodiedCarbonKey]: totalEmbodiedScaledByUsageAndTime,
      };
    });
  },
  allowArithmeticExpressions: [
    'baseline-vcpus',
    'baseline-memory',
    'baseline-emissions',
    'lifespan',
    'vcpu-emissions-constant',
    'memory-emissions-constant',
    'ssd-emissions-constant',
    'hdd-emissions-constant',
    'gpu-emissions-constant',
  ],
});
