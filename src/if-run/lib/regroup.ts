import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {PluginParams} from '@grnsft/if-core/types';

import {validate} from '../../common/util/validations';

import {STRINGS} from '../config';

const {InvalidGroupingError} = ERRORS;
const {INVALID_GROUP_KEY, REGROUP_ERROR} = STRINGS;

/**
 * Creates structure to insert inputs by groups.
 */
const appendGroup = (
  value: PluginParams,
  object: any,
  target: string,
  groups: string[]
): any => {
  if (groups.length === 0) {
    object[target] = object[target] || [];
    object[target].push(value);
    return object;
  }

  const group = groups.shift()!;
  object.children = object.children || {};
  object.children[group] = object.children[group] || {};

  return appendGroup(value, object.children[group], target, groups);
};

/**
 * Validates the groups array.
 */
const validateGroups = (groups: string[]): string[] => {
  const inputData = {regroup: groups};
  const validationSchema = z.record(
    z.string(),
    z.array(z.string(), {message: REGROUP_ERROR}).min(1)
  );

  validate(validationSchema, inputData);

  return groups;
};

/**
 * Looks up a group key value in the input.
 */
const lookupGroupKey = (input: PluginParams, groupKey: string): string => {
  if (!input[groupKey]) {
    throw new InvalidGroupingError(INVALID_GROUP_KEY(groupKey));
  }

  return input[groupKey];
};

/**
 * Regroups inputs and outputs based on the given group keys.
 */
export const Regroup = (
  inputs: PluginParams[],
  outputs: PluginParams[],
  groups: string[]
): any => {
  const validatedGroups = validateGroups(groups);

  const appendToAccumulator = (
    items: PluginParams[],
    acc: any,
    target: string
  ) => {
    for (const item of items) {
      const groupsWithData = validatedGroups.map(groupKey =>
        lookupGroupKey(item, groupKey)
      );
      appendGroup(item, acc, target, groupsWithData);
    }
  };

  const acc = {} as any;
  appendToAccumulator(inputs, acc, 'inputs');
  appendToAccumulator(outputs, acc, 'outputs');

  return acc.children;
};
