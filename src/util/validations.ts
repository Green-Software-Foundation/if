import {ZodIssue, z} from 'zod';

import {ERRORS} from './errors';

import {AGGREGATION_METHODS} from '../types/aggregation';
import {AGGREGATION_TYPES} from '../types/parameters';
import {Manifest} from '../types/manifest';

const {ImplValidationError} = ERRORS;

/**
 * Validation schema for impl files.
 */
const implValidation = z.object({
  name: z.string(),
  'if-version': z.string().optional().nullable(),
  description: z.string().nullable().default(''),
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
    .nullable()
    .default({}),
  initialize: z.object({
    plugins: z.record(
      z.string(),
      z.object({
        path: z.string(),
        model: z.string(),
        'global-config': z.record(z.string(), z.any()),
      })
    ),
  }),
  tree: z.record(z.string(), z.any()),
});

/**
 * Validates given `manifest` object to match pattern.
 */
export const validateManifest = (manifest: Manifest) => {
  const validatedImpl = implValidation.safeParse(manifest);

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
