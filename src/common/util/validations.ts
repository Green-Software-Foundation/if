import {ZodIssue, ZodIssueCode, ZodSchema, z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';

import {STRINGS} from '../../if-run/config';

import {
  AGGREGATION_METHODS,
  AGGREGATION_TYPES,
} from '../../if-run/types/aggregation';

const {ManifestValidationError, InputValidationError} = ERRORS;
const {VALIDATING_MANIFEST} = STRINGS;

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
 * Schema for parameter metadata.
 */
const parameterMetadataSchema = z
  .object({
    inputs: z
      .record(
        z.string(),
        z.object({
          unit: z.string(),
          description: z.string(),
          'aggregation-method': z.string(),
        })
      )
      .optional()
      .nullable(),
    outputs: z
      .record(
        z.string(),
        z.object({
          unit: z.string(),
          description: z.string(),
          'aggregation-method': z.string(),
        })
      )
      .optional()
      .nullable(),
  })
  .optional();

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
  explainer: z.boolean().optional(),
  explain: z.record(z.string(), z.any()).optional(),
  aggregation: z
    .object({
      metrics: z.record(
        z.object({
          method: z.enum(AGGREGATION_METHODS),
        })
      ),
      type: z.enum(AGGREGATION_TYPES),
    })
    .optional()
    .nullable(),
  initialize: z.object({
    plugins: z.record(
      z.string(),
      z
        .object({
          path: z.string(),
          method: z.string(),
          mapping: z.record(z.string(), z.string()).optional(),
          'global-config': z.record(z.string(), z.any()).optional(),
          'parameter-metadata': parameterMetadataSchema,
        })
        .optional()
    ),
  }),
  execution: z
    .object({
      command: z.string().optional(),
      environment: z
        .object({
          'if-version': z.string(),
          os: z.string(),
          'os-version': z.string(),
          'node-version': z.string(),
          'date-time': z.string(),
          dependencies: z.array(z.string()),
        })
        .optional(),
      status: z.string(),
      error: z.string().optional(),
    })
    .optional(),
  tree: z.record(z.string(), z.any()),
});

/**
 * Validates given `manifest` object to match pattern.
 */
export const validateManifest = (manifest: any) => {
  console.debug(VALIDATING_MANIFEST);

  return validate(manifestSchema, manifest, undefined, ManifestValidationError);
};

/**
 * Validates given `object` with given `schema`.
 */
export const validate = <T>(
  schema: ZodSchema<T>,
  object: any,
  index?: number,
  errorConstructor: ErrorConstructor = InputValidationError
) => {
  const validationResult = schema.safeParse(object);

  if (!validationResult.success) {
    throw new errorConstructor(
      prettifyErrorMessage(validationResult.error.message, index)
    );
  }

  return validationResult.data;
};

/**
 * Error message formatter for zod issues.
 */
const prettifyErrorMessage = (issues: string, index?: number) => {
  const issuesArray = JSON.parse(issues);

  return issuesArray.map((issue: ZodIssue) => {
    const code = issue.code;
    let {path, message} = issue;

    const indexErrorMessage = index !== undefined ? ` at index ${index}` : '';

    if (issue.code === ZodIssueCode.invalid_union) {
      message = issue.unionErrors[0].issues[0].message;
      path = issue.unionErrors[0].issues[0].path;
    }

    const fullPath = flattenPath(path);

    if (!fullPath) {
      return message;
    }

    return `"${fullPath}" parameter is ${message.toLowerCase()}${indexErrorMessage}. Error code: ${code}.`;
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
