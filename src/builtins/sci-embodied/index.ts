import {z} from 'zod';

import {ExecutePlugin, PluginParams} from '../../types/interface';

import {validate, allDefined} from '../../util/validations';

export const SciEmbodied = (): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
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
  const execute = (inputs: PluginParams[]) => {
    return inputs.map(input => {
      const safeInput = validateInput(input);

      return {
        ...input,
        'carbon-embodied': calculateEmbodiedCarbon(safeInput),
      };
    });
  };

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
    const errorMessage = (unit: string) =>
      `not a valid number in input. Please provide it as \`${unit}\``;

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
          invalid_type_error: errorMessage('count'),
        })
        .gte(0)
        .min(0),
      'vcpus-total': z
        .number({
          invalid_type_error: errorMessage('count'),
        })
        .gte(0)
        .min(0),
    };

    const resourcesSchemaPart = {
      'resources-reserved': z
        .number({
          invalid_type_error: errorMessage('count'),
        })
        .gte(0)
        .min(0),
      'resources-total': z
        .number({
          invalid_type_error: errorMessage('count'),
        })
        .gte(0)
        .min(0),
    };

    const schemaWithVcpus = z.object({
      ...commonSchemaPart(errorMessage),
      ...vcpusSchemaPart,
    });
    const schemaWithResources = z.object({
      ...commonSchemaPart(errorMessage),
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
