import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {PluginParams} from '@grnsft/if-core/types';

import {validate} from '../../common/util/validations';
import type {Node} from '../types/compute';

import {STRINGS} from '../config';

const {InvalidGroupingError} = ERRORS;
const {INVALID_GROUP_KEY, REGROUP_ERROR} = STRINGS;

/**
 * Creates structure to insert inputs by groups.
 */
const appendGroup = (
  value: PluginParams,
  object: Node,
  target: 'inputs' | 'outputs',
  groups: string[]
): Node => {
  if (groups.length === 0) {
    object[target] ||= [];
    object[target]!.push(value);
    return object;
  }

  const group = groups.shift()!;
  object.children ||= {};
  object.children[group] ||= {};

  return appendGroup(value, object.children[group], target, groups);
};

/**
 * Validates the groups array.
 */
const validateGroups = (groups: readonly string[]): readonly string[] => {
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
): Record<string, Node> => {
  const validatedGroups = validateGroups(groups);

  const appendToAccumulator = (
    items: PluginParams[],
    acc: Node,
    target: 'inputs' | 'outputs'
  ): void => {
    for (const item of items) {
      const groupsWithData = validatedGroups.map(groupKey =>
        lookupGroupKey(item, groupKey)
      );
      appendGroup(item, acc, target, groupsWithData);
    }
  };

  const acc: Node = {};
  appendToAccumulator(inputs, acc, 'inputs');
  appendToAccumulator(outputs, acc, 'outputs');

  return acc.children!;
};

/**
 * Grabs all the values according to grouping criteria, then
 *  checks if regroup values are present in the children list.
 */
export const isRegrouped = (
  groups: readonly string[],
  inputs: readonly PluginParams[],
  childNames: readonly string[]
): boolean => {
  const validatedGroups = validateGroups(groups);
  if (childNames.length < validatedGroups.length) {
    return false;
  } else if (childNames.length > validatedGroups.length) {
    childNames = childNames.slice(-validatedGroups.length);
  }
  return inputs.every(input =>
    validatedGroups.every((group, index) => input[group] === childNames[index])
  );
};
