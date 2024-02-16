import {PluginParams} from '../types/interface';

export type AggregatorOperations = {
  set: (current: PluginParams[]) => PluginParams[];
  get: () => PluginParams[];
  clear: () => PluginParams[];
};

export const aggregator = (metrics: string[]): AggregatorOperations => {
  let storage: PluginParams[] = [];

  const set = (current: PluginParams[]) => {
    if (storage.length === 0) {
      storage = current;

      return storage;
    }

    storage = current.reduce((acc: PluginParams[], item, index) => {
      const keys = Object.keys(item);
      const member: PluginParams = {};

      keys.forEach(key => {
        if (metrics.includes(key)) {
          member[key] = member[key] ?? 0;
          member[key] = item[key] + storage[index][key];
        }
      });

      acc.push(member);

      return acc;
    }, []);

    return storage;
  };

  const get = () => storage;

  const clear = () => {
    storage = [];

    return storage;
  };

  return {
    set,
    get,
    clear,
  };
};
