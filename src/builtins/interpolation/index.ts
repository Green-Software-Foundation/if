import Spline from 'typescript-cubic-spline';
import {z} from 'zod';

import {ExecutePlugin, PluginParams, ConfigParams} from '../../types/interface';

import {validate} from '../../util/validations';
import {ERRORS} from '../../util/errors';

import {Method} from './types';

const {ConfigNotFoundError} = ERRORS;

export const Interpolation = (globalConfig: ConfigParams): ExecutePlugin => {
  /**
   * Executes the energy consumption calculation for an array of input parameters.
   */
  const execute = (inputs: PluginParams[]) => {
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
   * Calculates energy consumption based on configuration and input parameters.
   * Determines the appropriate interpolation value based on the specified method type in the config.
   * Calculates the wattage based on the interpolation value and the duration of usage.
   * Computes the energy consumption, taking into account the allocated and total virtual CPUs if available.
   *
   * The duration is in seconds, the wattage is in watts, e.g. 30W x 300s = 9000 J.
   * To get the result in kWh, additional calculations are required:
   * 1 Wh = 3600 J
   * J / 3600 = Wh
   * Wh / 1000 = kWh
   * (wattage * duration) / (seconds in an hour) / 1000 = kWh
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
   * Calculates the wattage when the method is linear.
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
   * Calculates the wattage when the method is spline.
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
   * Calculates the wattage when the method is polynomial.
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
      throw new ConfigNotFoundError('Global config is not provided.');
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
        message: 'The elements count of `x` and `y` should be equal',
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
          message: `The \`${inputParameter}\` value of input[${index}] should not be out of the range of \`x\` elements`,
        }
      );

    return validate<z.infer<typeof schema>>(schema, input, index);
  };

  return {
    metadata: {
      kind: 'execute',
    },
    execute,
  };
};
