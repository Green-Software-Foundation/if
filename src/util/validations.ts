import {ZodIssue, z} from 'zod';

import {ERRORS} from './errors';

import {Impl} from '../types/impl';

const {ImplValidationError} = ERRORS;

const implValidation = z.object({
  name: z.string(),
  description: z.string().nullable(),
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
        kind: z.string().optional(),
        path: z.string().optional(),
        model: z.string().optional(),
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
