import {z} from 'zod';
import {
  ExecutePlugin,
  PluginParametersMetadata,
  PluginParams,
} from '@grnsft/if-core/types';

import {validate, allDefined} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {SCI_EMBODIED_ERROR} = STRINGS;

export const SciEmbodied = (
  parametersMetadata: PluginParametersMetadata
): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
    inputs: parametersMetadata?.inputs || {
      'device/emissions-embodied': {
        description: 'total embodied emissions of some component',
        unit: 'gCO2e',
      },
      'device/expected-lifespan': {
        description: 'Total Expected Lifespan of the Component in Seconds',
        unit: 'seconds',
      },
      'resources-reserved': {
        description: 'resources reserved for an application',
        unit: 'count',
      },
      'resources-total': {
        description: 'total resources available',
        unit: 'count',
      },
      'vcpus-allocated': {
        description: 'number of vcpus allocated to particular resource',
        unit: 'count',
      },
      'vcpus-total': {
        description: 'total number of vcpus available on a particular resource',
        unit: 'count',
      },
    },
    outputs: parametersMetadata?.outputs || {
      'carbon-embodied': {
        description: 'embodied emissions of the component',
        unit: 'gCO2e',
      },
    },
  };

  const METRICS = [
    'device/emissions-embodied',
    'device/expected-lifespan',
    'resources-reserved',
    'vcpus-allocated',
    'resources-total',
    'vcpus-total',
  ];

  /**
   * Calculate the Embodied carbon for a list of inputs.
   */
  const execute = (inputs: PluginParams[]) =>
    inputs.map(input => {
      const safeInput = validateInput(input);

      return {
        ...input,
        'carbon-embodied': calculateEmbodiedCarbon(safeInput),
      };
    });

  /**
   * Calculate the Embodied carbon for the input.
   * M = totalEmissions * (duration/ExpectedLifespan) * (resourcesReserved/totalResources)
   */
  const calculateEmbodiedCarbon = (input: PluginParams) => {
    const totalEmissions = input['device/emissions-embodied'];
    const duration = input['duration'];
    const expectedLifespan = input['device/expected-lifespan'];
    const resourcesReserved =
      input['vcpus-allocated'] || input['resources-reserved'];
    const totalResources = input['vcpus-total'] || input['resources-total'];

    return (
      totalEmissions *
      (duration / expectedLifespan) *
      (resourcesReserved / totalResources)
    );
  };

  /**
   * Checks for required fields in input.
   */
  const validateInput = (input: PluginParams) => {
    const commonSchemaPart = (errorMessage: (unit: string) => string) => ({
      'device/emissions-embodied': z
        .number({
          invalid_type_error: errorMessage('gCO2e'),
        })
        .gte(0)
        .min(0),
      'device/expected-lifespan': z
        .number({
          invalid_type_error: errorMessage('gCO2e'),
        })
        .gte(0)
        .min(0),
      duration: z
        .number({
          invalid_type_error: errorMessage('seconds'),
        })
        .gte(1),
    });

    const vcpusSchemaPart = {
      'vcpus-allocated': z
        .number({
          invalid_type_error: SCI_EMBODIED_ERROR('count'),
        })
        .gte(0)
        .min(0),
      'vcpus-total': z
        .number({
          invalid_type_error: SCI_EMBODIED_ERROR('count'),
        })
        .gte(0)
        .min(0),
    };

    const resourcesSchemaPart = {
      'resources-reserved': z
        .number({
          invalid_type_error: SCI_EMBODIED_ERROR('count'),
        })
        .gte(0)
        .min(0),
      'resources-total': z
        .number({
          invalid_type_error: SCI_EMBODIED_ERROR('count'),
        })
        .gte(0)
        .min(0),
    };

    const schemaWithVcpus = z.object({
      ...commonSchemaPart(SCI_EMBODIED_ERROR),
      ...vcpusSchemaPart,
    });
    const schemaWithResources = z.object({
      ...commonSchemaPart(SCI_EMBODIED_ERROR),
      ...resourcesSchemaPart,
    });

    const schema = schemaWithVcpus.or(schemaWithResources).refine(allDefined, {
      message: `All ${METRICS} should be present.`,
    });

    return validate<z.infer<typeof schema>>(schema, input);
  };

  return {
    metadata,
    execute,
  };
};
