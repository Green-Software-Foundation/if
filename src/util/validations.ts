import {ZodIssue, z} from 'zod';

import {PARAMETERS} from '../config/params';

import {ERRORS} from './errors';

import {AggregationMethods} from '../types/aggregator';
import {Impl} from '../types/impl';
import {ParameterKey} from '../types/units';

const {ImplValidationError} = ERRORS;

const ParameterKeys = Object.keys(PARAMETERS) as ParameterKey[];

/**
 * Zod literal union validator which checks if members are more than 2.
 */
const isValidZodLiteralUnion = <T extends z.ZodLiteral<unknown>>(
  literals: T[]
): literals is [T, T, ...T[]] => literals.length >= 2;

/**
 * Literal union type helper.
 */
const createUnionType = <T extends z.ZodLiteral<unknown>>(literals: T[]) => {
  if (!isValidZodLiteralUnion(literals)) {
    throw new Error(
      'Literals passed do not meet the criteria for constructing a union schema, the minimum length is 2.'
    );
  }

  return z.union(literals);
};

/**
 * Validation schema for impl files.
 */
const implValidation = z.object({
  name: z.string(),
  description: z.string().nullable(),
  aggregation: z
    .object({
      metrics: z.array(
        createUnionType(ParameterKeys.map(metric => z.literal(metric)))
      ),
      type: z.enum(AggregationMethods),
    })
    .optional(),
  params: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        aggregation: z.string(),
        unit: z.string(),
      })
    )
    .optional()
    .nullable(),
  tags: z
    .object({
      kind: z.string().optional(),
      complexity: z.string().optional(),
      category: z.string().optional(),
    })
    .nullable(),
  initialize: z.object({
    models: z.array(
      z.object({
        name: z.string(),
        path: z.string(),
        model: z.string(),
        config: z.record(z.string(), z.any()).optional(),
      })
    ),
  }),
  graph: z
    .object({
      children: z.record(z.string(), z.any()),
    })
    .required(),
});

/**
 * Validates given `impl` object to match pattern.
 */
export const validateImpl = (impl: Impl) => {
  const validatedImpl = implValidation.safeParse(impl);

  if (!validatedImpl.success) {
    const prettifyErrorMessage = (issues: string) => {
      const issuesArray = JSON.parse(issues);

      return issuesArray.map((issue: ZodIssue) => {
        const {code, path, message} = issue;
        const flattenPath = path.map(part =>
          typeof part === 'number' ? `[${part}]` : part
        );
        const fullPath = flattenPath.join('.');

        return `"${fullPath}" parameter is ${message.toLowerCase()}. Error code: ${code}.`;
      });
    };

    throw new ImplValidationError(
      prettifyErrorMessage(validatedImpl.error.message)
    );
  }

  return validatedImpl.data;
};
