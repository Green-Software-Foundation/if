import {ZodIssue, ZodSchema, z} from 'zod';

import {ERRORS} from './errors';

import {AGGREGATION_METHODS} from '../types/aggregation';
import {AGGREGATION_TYPES} from '../types/parameters';
import {Manifest} from '../types/manifest';

const {ManifestValidationError, InputValidationError} = ERRORS;

/**
 * Validation schema for manifests.
 */
const manifestValidation = z.object({
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
        method: z.string(),
        'global-config': z.record(z.string(), z.any()).optional(),
      })
    ),
    outputs: z.array(z.string()).optional(),
  }),
  tree: z.record(z.string(), z.any()),
});

/**
 * Validates given `manifest` object to match pattern.
 */
export const validateManifest = (manifest: Manifest) => {
  return validate(manifestValidation, manifest, ManifestValidationError);
};

/**
 * Validates given `object` with given `schema`.
 */
export const validate = <T>(
  schema: ZodSchema<T>,
  object: any,
  errorConstructor: ErrorConstructor = InputValidationError
) => {
  const validationResult = schema.safeParse(object);

  if (!validationResult.success) {
    throw new errorConstructor(
      prettifyErrorMessage(validationResult.error.message)
    );
  }

  return validationResult.data;
};

const prettifyErrorMessage = (issues: string) => {
  const issuesArray = JSON.parse(issues);

  return issuesArray.map((issue: ZodIssue) => {
    const {code, path, message} = issue;
    const flattenPath = path.map(part =>
      typeof part === 'number' ? `[${part}]` : part
    );
    const fullPath = flattenPath.join('.');

    if (code === 'custom') {
      return `${message.toLowerCase()}. Error code: ${code}.`;
    }
    return `"${fullPath}" parameter is ${message.toLowerCase()}. Error code: ${code}.`;
  });
};
