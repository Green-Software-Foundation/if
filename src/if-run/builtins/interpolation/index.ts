import Spline from 'typescript-cubic-spline';
import {z} from 'zod';

import {PluginParams, ConfigParams, Method} from '@grnsft/if-core/types';
import {PluginFactory} from '@grnsft/if-core/interfaces';
import {ERRORS} from '@grnsft/if-core/utils';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {X_Y_EQUAL, ARRAY_LENGTH_NON_EMPTY, WITHIN_THE_RANGE, MISSING_CONFIG} =
  STRINGS;

const {ConfigError} = ERRORS;

export const Interpolation = PluginFactory({
  metadata: {
    inputs: {},
    outputs: {},
  },
  configValidation: (config: ConfigParams) => {
    if (!config || !Object.keys(config)?.length) {
      throw new ConfigError(MISSING_CONFIG);
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

    const defaultMethod = config.method ?? Method.LINEAR;
    const updatedConfig = Object.assign({}, {method: defaultMethod}, config, {
      x: sortPoints(config.x),
      y: sortPoints(config.y),
    });

    return validate<z.infer<typeof schema>>(schema, updatedConfig);
  },
  inputValidation: (
    input: PluginParams,
    config: ConfigParams,
    index: number | undefined
  ) => {
    const inputParameter = config['input-parameter'];

    const schema = z
      .object({
        timestamp: z.string().or(z.date()),
        duration: z.number(),
        [inputParameter]: z.number().gt(0),
      })
      .refine(
        data =>
          data[inputParameter] >= config.x[0] &&
          data[inputParameter] <= config.x[config.x.length - 1],
        {
          message: WITHIN_THE_RANGE,
        }
      );

    return validate<z.infer<typeof schema>>(schema, input, index);
  },
  implementation: async (inputs: PluginParams[], config: ConfigParams) => {
    const {'output-parameter': outputParameter} = config;

    return inputs.map(input => {
      const calculatedResult = calculateResult(config, input);

      return {
        ...input,
        [outputParameter]: calculatedResult,
      };
    });
  },
  allowArithmeticExpressions: ['input-parameter'],
});

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
const getLinearInterpolation = (config: ConfigParams, input: PluginParams) => {
  const parameter =
    typeof config['input-parameter'] === 'number'
      ? config['input-parameter']
      : input[config['input-parameter']];
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
const getSplineInterpolation = (config: ConfigParams, input: PluginParams) => {
  const parameter =
    typeof config['input-parameter'] === 'number'
      ? config['input-parameter']
      : input[config['input-parameter']];
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
  const parameter =
    typeof config['input-parameter'] === 'number'
      ? config['input-parameter']
      : input[config['input-parameter']];
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

const sortPoints = (items: number[]) =>
  items.sort((a: number, b: number) => {
    return a - b;
  });
