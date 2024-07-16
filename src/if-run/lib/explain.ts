import {ExplainParams} from '../types/explain';

/**
 * Retrieves stored explain data.
 */
export const explain = () => storeExplainData.plugins;

/**
 * Manages the storage of explain data.
 */
const storeExplainData = (() => {
  let plugin = {};

  const pluginManager = {
    get plugins() {
      return plugin;
    },
    set plugins(value: object) {
      plugin = value;
    },
  };

  return pluginManager;
})();

/**
 * Adds new explain data to the stored explain data.
 */
export const addExplainData = (params: ExplainParams) => {
  const {pluginName, pluginData, metadata} = params;
  const plugin = {
    [pluginName]: {
      method: pluginData.method,
      path: pluginData.path,
      inputs: metadata?.inputs || 'undefined',
      outputs: metadata?.outputs || 'undefined',
    },
  };

  storeExplainData.plugins = {
    ...storeExplainData.plugins,
    ...plugin,
  };
};
