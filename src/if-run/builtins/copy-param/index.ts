import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {
  ExecutePlugin,
  PluginParametersMetadata,
  PluginParams,
} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {MISSING_CONFIG} = STRINGS;
const {ConfigError} = ERRORS;
//   keep-existing: true/false (whether to remove the parameter you are copying from)
//   from-param: the parameter you are copying from (e.g. cpu/name)
//   to-field: the parameter you are copying to (e.g. cpu/processor-name)

export const Copy = (
  config: Record<string, any>,
  parametersMetadata: PluginParametersMetadata
): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
    inputs: parametersMetadata?.inputs,
    outputs: parametersMetadata?.outputs,
  };

  /**
   * Checks config value are valid.
   */
  const validateConfig = () => {
    if (!config) {
      throw new ConfigError(MISSING_CONFIG);
    }

    const configSchema = z.object({
      'keep-existing': z.boolean(),
      from: z.string().min(1),
      to: z.string().min(1),
    });

    return validate<z.infer<typeof configSchema>>(configSchema, config);
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
    const safeGlobalConfig = validateConfig();
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

      return {
        ...safeInput, // need to return or what you provide won't be outputted, don't be evil!
        [to]: outputValue,
      };
    });
  };

  return {
    metadata,
    execute,
  };
};
