import {ERRORS} from '@grnsft/if-core/utils';

import {STRINGS} from '../config';

import {PluginStorage} from '../types/plugin-storage';
import {PluginInterface} from '../types/interface';

const {PluginInitializationError} = ERRORS;
const {NOT_INITALIZED_PLUGIN} = STRINGS;

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
        throw new PluginInitializationError(NOT_INITALIZED_PLUGIN(name));
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
