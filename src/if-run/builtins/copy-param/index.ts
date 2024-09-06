import {z} from 'zod';
import {
  ERRORS,
  evaluateInput,
  evaluateConfig,
  evaluateArithmeticOutput,
  getParameterFromArithmeticExpression,
} from '@grnsft/if-core/utils';
import {
  mapConfigIfNeeded,
  mapOutputIfNeeded,
} from '@grnsft/if-core/utils/helpers';
import {
  ConfigParams,
  ExecutePlugin,
  MappingParams,
  PluginParametersMetadata,
  PluginParams,
} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {MISSING_CONFIG} = STRINGS;
const {ConfigError} = ERRORS;

/**
 * keep-existing: true/false (whether to remove the parameter you are copying from)
 * from-param: the parameter you are copying from (e.g. cpu/name)
 * to-field: the parameter you are copying to (e.g. cpu/processor-name)
 */

export const Copy = (
  config: ConfigParams,
  parametersMetadata: PluginParametersMetadata,
  mapping: MappingParams
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

    const mappedConfig = mapConfigIfNeeded(config, mapping);

    const configSchema = z.object({
      'keep-existing': z.boolean(),
      from: z.string().min(1).or(z.number()),
      to: z.string().min(1),
    });

    return validate<z.infer<typeof configSchema>>(configSchema, mappedConfig);
  };

  /**
   * Checks for required fields in input.
   */
  const validateSingleInput = (
    input: PluginParams,
    configInputParameter: string | number
  ) => {
    const inputParameter = getParameterFromArithmeticExpression(
      configInputParameter.toString()
    );
    const evaluatedInput = evaluateInput(input);
    const inputData = {
      [inputParameter]: evaluatedInput[inputParameter],
    };

    const validationSchema = z.record(z.string(), z.string().or(z.number()));

    validate(validationSchema, inputData);

    return evaluatedInput;
  };

  const execute = (inputs: PluginParams[]) => {
    const safeConfig = validateConfig();
    const keepExisting = safeConfig['keep-existing'] === true;
    const from = safeConfig['from'];
    const to = safeConfig['to'];

    return inputs.map(input => {
      const evaluatedConfig = evaluateConfig({
        config: safeConfig,
        input,
        parametersToEvaluate: ['from'],
      });

      const safeInput = validateSingleInput(input, from);
      const safeFrom = getParameterFromArithmeticExpression(from.toString());

      const outputValue = !isNaN(evaluatedConfig?.from)
        ? evaluatedConfig.from
        : safeInput[safeFrom];

      if (safeInput[safeFrom]) {
        if (!keepExisting) {
          delete input[safeFrom];
          delete safeInput[safeFrom];
        }
      }

      const result = {
        ...input,
        ...safeInput,
        ...evaluateArithmeticOutput(to, outputValue),
      };

      return mapOutputIfNeeded(result, mapping);
    });
  };

  return {
    metadata,
    execute,
  };
};
