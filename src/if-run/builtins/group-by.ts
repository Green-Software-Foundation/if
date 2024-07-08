import {z} from 'zod';
import {ERRORS} from '@grnsft/if-core/utils';
import {
  GroupByPlugin,
  PluginParams,
  GroupByConfig,
} from '@grnsft/if-core/types';

import {STRINGS} from '../config';

import {validate} from '../../common/util/validations';

const {InvalidGroupingError, GlobalConfigError} = ERRORS;

const {INVALID_GROUP_BY, MISSING_GLOBAL_CONFIG} = STRINGS;

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
      const validatedConfig = validateConfig(config);
      const groups = validatedConfig.group.map(groupType => {
        if (!input[groupType]) {
          throw new InvalidGroupingError(INVALID_GROUP_BY(groupType));
        }

        return input[groupType];
      });

      acc = {
        ...acc,
        ...appendGroup(input, acc, groups),
      };

      return acc;
    }, {} as any).children;

  /**
   * Validates config parameter.
   */
  const validateConfig = (config: GroupByConfig) => {
    if (!config) {
      throw new GlobalConfigError(MISSING_GLOBAL_CONFIG);
    }

    const schema = z.object({
      group: z.array(z.string()).min(1),
    });

    return validate<z.infer<typeof schema>>(schema, config);
  };

  return {metadata, execute};
};
