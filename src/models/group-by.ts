import {ERRORS} from '../util/errors';

import {STRINGS} from '../config';

import {GroupByPlugin, PluginParams} from '../types/interface';
import {GroupByConfig} from '../types/group-by';

const {InvalidGrouping} = ERRORS;

const {INVALID_GROUP_BY} = STRINGS;

/**
 * Plugin for inputs grouping.
 */
export const GroupBy = (): GroupByPlugin => {
  const metadata = {
    kind: 'groupby',
  };

  /**
   * Creates structure to insert inputs by groups.
   */
  const appendGroup = (
    value: PluginParams,
    object: any,
    groups: string[]
  ): any => {
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
   * Interates over inputs, grabs config-group types values for each one.
   * Based on grouping types, initializes the structure grouped structure.
   */
  const execute = (inputs: PluginParams[], config: GroupByConfig) =>
    inputs.reduce((acc, input) => {
      const groups = config.group.map(groupType => {
        if (!input[groupType]) {
          throw new InvalidGrouping(INVALID_GROUP_BY(groupType));
        }

        return input[groupType];
      });

      acc = {
        ...acc,
        ...appendGroup(input, acc, groups),
      };

      return acc;
    }, {} as any).children;

  return {metadata, execute};
};
