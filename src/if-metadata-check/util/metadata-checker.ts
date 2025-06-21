import {IFPlugin} from '../types/plugin';

/**
 * Extracts a set of parameter values from the configurations of the provided plugins.
 *
 * @param plugins - An array of plugins, each containing configuration data.
 * @param parameters - Additional parameter keys to extract from the plugin configurations.
 * @returns A set of parameter values extracted from the plugin configurations.
 */
export const getParameters = (plugins: IFPlugin[], parameters: string[]) => {
  return new Set<string>(
    plugins.flatMap(plugin =>
      extractParameters(plugin.config, [
        'input-parameter',
        'output-parameter',
        'input-parameters',
        'output',
        ...parameters,
      ])
    )
  );
};

/**
 * Extracts a set of parameters that have defined metadata from the provided plugins.
 *
 * @param plugins - An array of plugins, each containing metadata information.
 * @returns A set of parameter names that have associated metadata.
 */
export const getParametersWithMetadata = (plugins: IFPlugin[]) => {
  return new Set<string>(
    plugins.flatMap(plugin => extractParametersWithMetadata(plugin))
  );
};

/**
 * Extracts parameters with metadata from a single plugin.
 *
 * @param plugin - A plugin object containing metadata information.
 * @returns An array of parameter names that have associated metadata, including inputs and outputs.
 */
export const extractParametersWithMetadata = (plugin: IFPlugin) => {
  if (!plugin['parameter-metadata']) return [];
  const {inputs, outputs} = plugin['parameter-metadata'];
  return [
    ...(inputs ? Object.keys(inputs) : []),
    ...(outputs ? Object.keys(outputs) : []),
  ];
};

/**
 * Extracts parameter values from a plugin's configuration based on specified keys.
 *
 * @param config - The configuration object of a plugin.
 * @param keys - An array of keys to look for in the configuration object.
 * @returns An array of parameter values corresponding to the specified keys.
 */
export const extractParameters = (
  config: Record<string, any> | undefined,
  keys: string[]
) => {
  if (!config) return [];
  return keys.flatMap(key => {
    if (key in config && isStringOrStringArray(config[key])) {
      return config[key];
    }
    return [];
  });
};

/**
 * Calculates the coverage of metadata for a given set of parameters.
 *
 * @param parameterSet - A set of all parameters extracted from plugin configurations.
 * @param parameterWithMetadataSet - A set of parameters that have associated metadata.
 * @returns An object containing:
 *   - `percentage`: The percentage of parameters with metadata coverage.
 *   - `missingParameters`: An array of parameters that lack metadata coverage.
 */
export const calculateMetadataCoverage = (
  parameterSet: Set<string>,
  parameterWithMetadataSet: Set<string>
) => {
  const totalParameters = parameterSet.size;
  const parametersWithMetadata = [...parameterSet].filter(param =>
    parameterWithMetadataSet.has(param)
  ).length;
  const percentage =
    totalParameters === 0
      ? 100
      : (parametersWithMetadata / totalParameters) * 100;

  const missingParameters = [...parameterSet].filter(
    parameter => !parameterWithMetadataSet.has(parameter)
  );

  return {percentage, missingParameters};
};

/**
 * Checks if the given parameter is a string or an array of strings.
 *
 * @param parameter - The parameter to validate.
 * @returns `true` if the parameter is a string or an array of strings, otherwise `false`.
 */
const isStringOrStringArray = (parameter: unknown): boolean => {
  if (typeof parameter === 'string') {
    return true;
  }
  if (Array.isArray(parameter)) {
    return parameter.every(item => typeof item === 'string');
  }
  return false;
};
