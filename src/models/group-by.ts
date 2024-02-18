import {PluginParams} from '../types/interface';

/**
 * Plugin for inputs grouping.
 */
export const GroupBy = () => {
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
  const execute = (inputs: PluginParams[], config: string[]) =>
    inputs.reduce(
      (acc, input) => {
        const groups = config.map(groupType => input[groupType]);

        acc = {
          ...acc,
          ...appendGroup(input, acc, groups),
        };

        return acc;
      },
      {children: {}} as any
    );

  return {metadata, execute};
};
