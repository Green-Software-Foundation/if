import Spline from 'typescript-cubic-spline';
import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {
  ExecutePlugin,
  PluginParams,
  ConfigParams,
  Method,
  PluginParametersMetadata,
  MappingParams,
} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';
import {mapConfigIfNeeded} from '../../../common/util/helpers';

import {STRINGS} from '../../config';

const {GlobalConfigError} = ERRORS;
const {
  MISSING_GLOBAL_CONFIG,
  X_Y_EQUAL,
  ARRAY_LENGTH_NON_EMPTY,
  WITHIN_THE_RANGE,
} = STRINGS;

export const Interpolation = (
  globalConfig: ConfigParams,
  parametersMetadata: PluginParametersMetadata,
  mapping: MappingParams
): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
    inputs: parametersMetadata?.inputs,
    outputs: parametersMetadata?.outputs,
  };

  /**
   * Executes the energy consumption calculation for an array of input parameters.
   */
  const execute = (inputs: PluginParams[]) => {
    globalConfig = mapConfigIfNeeded(globalConfig, mapping);

    const validatedConfig = validateConfig();

    return inputs.map((input, index) => {
      const safeInput = validateInput(input, index);
      const result = calculateResult(validatedConfig, safeInput);

      return {
        ...input,
        [validatedConfig['output-parameter']]: result,
      };
    });
  };

  /**
   * Calculates the appropriate interpolation value based on the specified method type in the config and input parameters.
   */
  const calculateResult = (config: ConfigParams, input: PluginParams) => {
    const methodType: {[key: string]: number} = {
      linear: getLinearInterpolation(config, input),
      spline: getSplineInterpolation(config, input),
      polynomial: getPolynomialInterpolation(config, input),
    };

    return methodType[config.method];
  };

  /**
   * Calculates the interpolation when the method is linear.
   */
  const getLinearInterpolation = (
    config: ConfigParams,
    input: PluginParams
  ) => {
    const parameter = input[globalConfig['input-parameter']];
    const xPoints: number[] = config.x;
    const yPoints: number[] = config.y;

    const result = xPoints.reduce(
      (acc, xPoint, i) => {
        if (parameter === xPoint) {
          acc.baseCpu = xPoint;
          acc.baseRate = yPoints[i];
        } else if (parameter > xPoint && parameter < xPoints[i + 1]) {
          acc.baseCpu = xPoint;
          acc.baseRate = yPoints[i];
          acc.ratio = (yPoints[i + 1] - yPoints[i]) / (xPoints[i + 1] - xPoint);
        }

        return acc;
      },
      {baseRate: 0, baseCpu: 0, ratio: 0}
    );

    return result.baseRate + (parameter - result.baseCpu) * result.ratio;
  };

  /**
   * Calculates the interpolation when the method is spline.
   */
  const getSplineInterpolation = (
    config: ConfigParams,
    input: PluginParams
  ) => {
    const parameter = input[globalConfig['input-parameter']];
    const xPoints: number[] = config.x;
    const yPoints: number[] = config.y;
    const spline: any = new Spline(xPoints, yPoints);

    return spline.at(parameter);
  };

  /**
   * Calculates the interpolation when the method is polynomial.
   */
  const getPolynomialInterpolation = (
    config: ConfigParams,
    input: PluginParams
  ) => {
    const parameter = input[globalConfig['input-parameter']];
    const xPoints: number[] = config.x;
    const yPoints: number[] = config.y;

    const result = xPoints.reduce((acc, x, i) => {
      const term =
        yPoints[i] *
        xPoints.reduce((prod, xPoint, j) => {
          if (j !== i) {
            return (prod * (parameter - xPoint)) / (x - xPoint);
          }
          return prod;
        }, 1);
      return acc + term;
    }, 0);

    return result;
  };

  /**
   * Validates global config parameters.
   * Sorts elements of `x` and `y`.
   */
  const validateConfig = () => {
    if (!globalConfig) {
      throw new GlobalConfigError(MISSING_GLOBAL_CONFIG);
    }

    const schema = z
      .object({
        method: z.nativeEnum(Method),
        x: z.array(z.number()),
        y: z.array(z.number()),
        'input-parameter': z.string(),
        'output-parameter': z.string(),
      })
      .refine(data => data.x && data.y && data.x.length === data.y.length, {
        message: X_Y_EQUAL,
      })
      .refine(data => data.x.length > 1 && data.y.length > 1, {
        message: ARRAY_LENGTH_NON_EMPTY,
      });

    const defaultMethod = globalConfig.method ?? Method.LINEAR;
    const updatedConfig = Object.assign(
      {},
      {method: defaultMethod},
      globalConfig,
      {
        x: sortPoints(globalConfig.x),
        y: sortPoints(globalConfig.y),
      }
    );

    return validate<z.infer<typeof schema>>(schema, updatedConfig);
  };

  const sortPoints = (items: number[]) =>
    items.sort((a: number, b: number) => {
      return a - b;
    });

  /**
   * Validates inputes parameters.
   */
  const validateInput = (input: PluginParams, index: number) => {
    const inputParameter = globalConfig['input-parameter'];
    const schema = z
      .object({
        timestamp: z.string().or(z.date()),
        duration: z.number(),
        [inputParameter]: z.number().gt(0),
      })
      .refine(
        data =>
          data[inputParameter] >= globalConfig.x[0] &&
          data[inputParameter] <= globalConfig.x[globalConfig.x.length - 1],
        {
          message: WITHIN_THE_RANGE,
        }
      );

    return validate<z.infer<typeof schema>>(schema, input, index);
  };

  return {
    metadata,
    execute,
  };
};
