import {z} from 'zod';
import {
  ERRORS,
  evaluateInput,
  evaluateConfig,
  evaluateArithmeticOutput,
  validateArithmeticExpression,
  getParameterFromArithmeticExpression,
} from '@grnsft/if-core/utils';
import {
  mapInputIfNeeded,
  mapConfigIfNeeded,
  mapOutputIfNeeded,
} from '@grnsft/if-core/utils/helpers';
import {
  ExecutePlugin,
  PluginParams,
  ConfigParams,
  PluginParametersMetadata,
  ParameterMetadata,
  MappingParams,
} from '@grnsft/if-core/types';

import {validate, allDefined} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {ConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

const {MissingInputDataError} = ERRORS;
const {
  MISSING_FUNCTIONAL_UNIT_CONFIG,
  MISSING_FUNCTIONAL_UNIT_INPUT,
  SCI_MISSING_FN_UNIT,
  ZERO_DIVISION,
} = STRINGS;

export const Sci = (
  config: ConfigParams,
  parametersMetadata: PluginParametersMetadata,
  mapping: MappingParams
): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
    inputs: {
      ...({
        carbon: {
          description: 'an amount of carbon emitted into the atmosphere',
          unit: 'gCO2e',
          'aggregation-method': {
            time: 'sum',
            component: 'sum',
          },
        },
        'functional-unit': {
          description:
            'the name of the functional unit in which the final SCI value should be expressed, e.g. requests, users',
          unit: 'none',
          'aggregation-method': {
            time: 'sum',
            component: 'sum',
          },
        },
      } as ParameterMetadata),
      ...parametersMetadata?.inputs,
    },
    outputs: parametersMetadata?.outputs || {
      sci: {
        description: 'carbon expressed in terms of the given functional unit',
        unit: 'gCO2e',
        'aggregation-method': {
          time: 'avg',
          component: 'sum',
        },
      },
    },
  };

  /**
   * Validates config.
   */
  const validateConfig = () => {
    if (!config) {
      throw new ConfigError(MISSING_CONFIG);
    }

    const mappedConfig = mapConfigIfNeeded(config, mapping);
    const schema = z
      .object({
        'functional-unit': z
          .string()
          .refine(param =>
            validateArithmeticExpression('functional-unit', param)
          ),
      })
      .refine(data => data['functional-unit'], {
        message: MISSING_FUNCTIONAL_UNIT_CONFIG,
      });

    return validate<z.infer<typeof schema>>(schema, mappedConfig);
  };

  /**
   * Calculate the total emissions for a list of inputs.
   */
  const execute = (inputs: PluginParams[]): PluginParams[] => {
    const safeConfig = validateConfig();

    return inputs.map((input, index) => {
      const safeInput = Object.assign(
        {},
        input,
        validateInput(input, safeConfig)
      );

      const evaluatedConfig = evaluateConfig({
        config: safeConfig,
        input: safeInput,
        parametersToEvaluate: ['functional-unit'],
      });
      const functionalUnit = isNaN(evaluatedConfig['functional-unit'])
        ? safeInput[evaluatedConfig['functional-unit']]
        : evaluatedConfig['functional-unit'];

      if (functionalUnit === 0) {
        console.warn(ZERO_DIVISION(Sci.name, index));

        return {
          ...input,
          ...safeInput,
          sci: safeInput['carbon'],
        };
      }
      const calculatedResult = safeInput['carbon'] / functionalUnit;

      const result = {
        ...input,
        ...safeInput,
        ...evaluateArithmeticOutput('sci', calculatedResult),
      };

      return mapOutputIfNeeded(result, mapping);
    });
  };

  /**
   * Checks for fields in input.
   */
  const validateInput = (input: PluginParams, safeConfig: ConfigParams) => {
    const mappedInput = mapInputIfNeeded(input, mapping);

    const functionalUnit = getParameterFromArithmeticExpression(
      safeConfig['functional-unit']
    );

    if (!(functionalUnit in mappedInput && mappedInput[functionalUnit] >= 0)) {
      throw new MissingInputDataError(MISSING_FUNCTIONAL_UNIT_INPUT);
    }

    const schema = z
      .object({
        carbon: z.number().gte(0),
        duration: z.number().gte(1),
      })
      .refine(allDefined, {
        message: SCI_MISSING_FN_UNIT(config['functional-unit']),
      });

    const evaluatedInput = evaluateInput(mappedInput);

    return validate<z.infer<typeof schema>>(schema, evaluatedInput);
  };

  return {
    metadata,
    execute,
  };
};
