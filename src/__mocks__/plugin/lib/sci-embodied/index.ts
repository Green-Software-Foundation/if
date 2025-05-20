import {PluginFactory} from '@grnsft/if-core/interfaces';
import {PluginParams} from '@grnsft/if-core/types';

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
    },
    outputs: {
      'embodied-carbon': {
        description: 'embodied carbon for a resource, scaled by usage',
        unit: 'gCO2eq',
        'aggregation-method': {
          time: 'sum',
          component: 'sum',
        },
      },
    },
  },
  implementation: async (inputs: PluginParams[]) => inputs,
});
