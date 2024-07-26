import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {
  ConfigParams,
  ExecutePlugin,
  MappingParams,
  PluginParametersMetadata,
  PluginParams,
} from '@grnsft/if-core/types';

import {PluginSettings} from '../../../common/types/manifest';
import {validate} from '../../../common/util/validations';
import {mapOutput} from '../../../common/util/helpers';

import {STRINGS} from '../../config';

const {MISSING_GLOBAL_CONFIG} = STRINGS;
const {GlobalConfigError} = ERRORS;

/**
 * keep-existing: true/false (whether to remove the parameter you are copying from)
 * from-param: the parameter you are copying from (e.g. cpu/name)
 * to-field: the parameter you are copying to (e.g. cpu/processor-name)
 */

export const Copy = (options: PluginSettings): ExecutePlugin => {
  const {
    'global-config': globalConfig,
    'parameter-metadata': parametersMetadata,
    mapping,
  } = options as {
    'global-config': ConfigParams;
    'parameter-metadata': PluginParametersMetadata;
    mapping: MappingParams;
  };
  const metadata = {
    kind: 'execute',
    inputs: parametersMetadata?.inputs,
    outputs: parametersMetadata?.outputs,
  };

  /**
   * Checks global config value are valid.
   */
  const validateGlobalConfig = () => {
    if (!globalConfig) {
      throw new GlobalConfigError(MISSING_GLOBAL_CONFIG);
    }

    const globalConfigSchema = z.object({
      'keep-existing': z.boolean(),
      from: z.string().min(1),
      to: z.string().min(1),
    });

    return validate<z.infer<typeof globalConfigSchema>>(
      globalConfigSchema,
      globalConfig
    );
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (
    input: PluginParams,
    inputParameters: string[]
  ) => {
    const inputData = inputParameters.reduce(
      (acc, param) => {
        acc[param] = input[param];

        return acc;
      },
      {} as Record<string, string>
    );

    const validationSchema = z.record(z.string(), z.string());

    validate(validationSchema, inputData);

    return input;
  };

  const execute = (inputs: PluginParams[]) => {
    const safeGlobalConfig = validateGlobalConfig();
    const keepExisting = safeGlobalConfig['keep-existing'] === true;
    const from = safeGlobalConfig['from'];
    const to = safeGlobalConfig['to'];

    return inputs.map(input => {
      const safeInput = validateSingleInput(input, [from]);

      const outputValue = safeInput[from];
      if (safeInput[from]) {
        if (!keepExisting) {
          delete safeInput[from];
        }
      }

      const output = {
        ...safeInput, // need to return or what you provide won't be outputted, don't be evil!
        [to]: outputValue,
      };

      return mapOutput(output, mapping);
    });
  };

  return {
    metadata,
    execute,
  };
};
