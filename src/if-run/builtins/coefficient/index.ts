import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {
  CoefficientConfig,
  ExecutePlugin,
  MappingParams,
  PluginParametersMetadata,
  PluginParams,
} from '@grnsft/if-core/types';

import {PluginSettings} from '../../../common/types/manifest';
import {validate} from '../../../common/util/validations';
import {mapOutput} from '../../../common/util/helpers';

import {STRINGS} from '../../config';

const {GlobalConfigError} = ERRORS;
const {MISSING_GLOBAL_CONFIG} = STRINGS;

export const Coefficient = (options: PluginSettings): ExecutePlugin => {
  const {
    'global-config': globalConfig,
    'parameter-metadata': parametersMetadata,
    mapping,
  } = options as {
    'global-config': CoefficientConfig;
    'parameter-metadata': PluginParametersMetadata;
    mapping: MappingParams;
  };
  const metadata = {
    kind: 'execute',
    inputs: parametersMetadata?.inputs || {
      carbon: {
        description: 'an amount of carbon emitted into the atmosphere',
        unit: 'gCO2e',
        'aggregation-method': 'sum',
      },
    },
    outputs: parametersMetadata?.outputs || {
      'carbon-product': {
        description: 'a product of cabon property and the coefficient',
        unit: 'gCO2e',
        'aggregation-method': 'sum',
      },
    },
  };

  /**
   * Calculate the product of each input parameter.
   */
  const execute = (inputs: PluginParams[]) => {
    const safeGlobalConfig = validateGlobalConfig();
    const inputParameter = safeGlobalConfig['input-parameter'];
    const outputParameter = safeGlobalConfig['output-parameter'];
    const coefficient = safeGlobalConfig['coefficient'];

    return inputs.map(input => {
      validateSingleInput(input, inputParameter);

      const output = {
        ...input,
        [outputParameter]: calculateProduct(input, inputParameter, coefficient),
      };

      return mapOutput(output, mapping);
    });
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (input: PluginParams, inputParameter: string) => {
    const inputData = {
      'input-parameter': input[inputParameter],
    };
    const validationSchema = z.record(z.string(), z.number());
    validate(validationSchema, inputData);

    return input;
  };

  /**
   * Calculates the product of the energy components.
   */
  const calculateProduct = (
    input: PluginParams,
    inputParameter: string,
    coefficient: number
  ) => input[inputParameter] * coefficient;

  /**
   * Checks global config value are valid.
   */
  const validateGlobalConfig = () => {
    if (!globalConfig) {
      throw new GlobalConfigError(MISSING_GLOBAL_CONFIG);
    }

    const globalConfigSchema = z.object({
      coefficient: z.number(),
      'input-parameter': z.string().min(1),
      'output-parameter': z.string().min(1),
    });

    return validate<z.infer<typeof globalConfigSchema>>(
      globalConfigSchema,
      globalConfig
    );
  };

  return {
    metadata,
    execute,
  };
};
