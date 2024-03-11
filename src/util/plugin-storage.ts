import {ERRORS} from '../util/errors';

import {PluginInterface} from '../types/interface';
import {PluginStorage} from '../types/plugin-storage';

const {PluginInitalizationError} = ERRORS;

/**
 * Storage for maintaining plugins.
 */
export const pluginStorage = () => {
  const storage: PluginStorage = {};

  return {
    /**
     * Gets plugin by given `name`. If it's missing then throws error.
     */
    get: (name: string) => {
      const plugin = storage[name];

      if (!plugin) {
        throw new PluginInitalizationError(
          `Not initalized plugin: ${name}. Check if ${name} is in 'manifest.initalize.plugins'.`
        );
      }

      return plugin;
    },
    /**
     * Saves given `plugin` with given `name`.
     */
    set: function (name: string, plugin: PluginInterface) {
      storage[name] = plugin;

      return this;
    },
  };
};
