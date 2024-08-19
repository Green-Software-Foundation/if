import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {PluginParams} from '@grnsft/if-core/types';

import {validate} from '../../common/util/validations';

import {STRINGS} from '../config';

const {InvalidGroupingError} = ERRORS;

const {INVALID_GROUP_KEY, REGROUP_ERROR} = STRINGS;

/**
 * Grouping strategy.
 */
export const Regroup = (inputs: PluginParams[], groups: string[]) => {
  /**
   * Creates structure to insert inputs by groups.
   */
  const appendGroup = (value: PluginParams, object: any, groups: string[]) => {
    if (groups.length > 0) {
      const group = groups.shift() as string;

      object.children = object.children ?? {};
      object.children[group] = object.children[group] ?? {};

      if (groups.length === 0) {
        if (
          object.children[group].inputs &&
          object.children[group].inputs.length > 0
        ) {
          object.children[group].inputs.push(value);
        } else {
          object.children[group].inputs = [value];
        }
      }

      appendGroup(value, object.children[group], groups);
    }

    return object;
  };

  /**
   * Validates groups array.
   */
  const validateGroups = (regroup: string[]) => {
    const inputData = {regroup};
    const validationSchema = z.record(
      z.string(),
      z.array(z.string(), {message: REGROUP_ERROR}).min(1)
    );

    validate(validationSchema, inputData);

    return groups;
  };

  /**
   * Interates over inputs, grabs group values for each one.
   * Based on grouping, initializes the structure.
   */

  const validatedGroups = validateGroups(groups);

  let acc = {} as any;
  for (const input of inputs) {
    const groupsWithData = validatedGroups.map(groupType => {
      if (!input[groupType]) {
        throw new InvalidGroupingError(INVALID_GROUP_KEY(groupType));
      }

      return input[groupType];
    });

    acc = {
      ...acc,
      ...appendGroup(input, acc, groupsWithData),
    };
  }

  return acc.children;
};
