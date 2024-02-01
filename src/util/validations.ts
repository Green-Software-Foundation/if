import {ZodIssue, z} from 'zod';

import {ERRORS} from './errors';

import {AGGREGATION_METHODS} from '../types/aggregator';
import {AGGREGATION_TYPES} from '../types/parameters';
import {Impl} from '../types/impl';

const {ImplValidationError} = ERRORS;

/**
 * Validation schema for impl files.
 */
const implValidation = z.object({
  name: z.string(),
  'if-version': z.string().optional().nullable(),
  description: z.string().nullable(),
  aggregation: z
    .object({
      metrics: z.array(z.string()),
      type: z.enum(AGGREGATION_METHODS),
    })
    .optional(),
  params: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        aggregation: z.enum(AGGREGATION_TYPES),
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
