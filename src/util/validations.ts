import {ZodIssue, ZodIssueCode, ZodSchema, z} from 'zod';

import {ERRORS} from './errors';

import {AGGREGATION_METHODS} from '../types/aggregation';
import {AGGREGATION_TYPES} from '../types/parameters';

const {ManifestValidationError, InputValidationError} = ERRORS;

/**
 * At least one property defined handler.
 */
export const atLeastOneDefined = (
  obj: Record<string | number | symbol, unknown>
) => Object.values(obj).some(v => v !== undefined);

/**
 * All properties are defined handler.
 */
export const allDefined = (obj: Record<string | number | symbol, unknown>) =>
  Object.values(obj).every(v => v !== undefined);

/**
 * Validation schema for manifests.
 */
export const manifestSchema = z.object({
  name: z.string(),
  description: z.string().optional().nullable(),
  tags: z
    .object({
      kind: z.string().optional().nullable(),
      complexity: z.string().optional().nullable(),
      category: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  aggregation: z
    .object({
      metrics: z.array(z.string()),
      type: z.enum(AGGREGATION_METHODS),
    })
    .optional()
    .nullable(),
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
  'if-version': z.string().optional().nullable(),
});

/**
 * Validates given `manifest` object to match pattern.
 */
export const validateManifest = (manifest: any) =>
  validate(manifestSchema, manifest, ManifestValidationError);

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

/**
 * Error message formatter for zod issues.
 */
const prettifyErrorMessage = (issues: string) => {
  const issuesArray = JSON.parse(issues);

  return issuesArray.map((issue: ZodIssue) => {
    const code = issue.code;
    let {path, message} = issue;

    if (issue.code === ZodIssueCode.invalid_union) {
      message = issue.unionErrors[0].issues[0].message;
      path = issue.unionErrors[0].issues[0].path;
    }

    const fullPath = flattenPath(path);

    if (!fullPath) {
      return message;
    }

    return `"${fullPath}" parameter is ${message.toLowerCase()}. Error code: ${code}.`;
  });
};

/**
 * Flattens an array representing a nested path into a string.
 */
const flattenPath = (path: (string | number)[]): string => {
  const flattenPath = path.map(part =>
    typeof part === 'number' ? `[${part}]` : part
  );
  return flattenPath.join('.');
};
