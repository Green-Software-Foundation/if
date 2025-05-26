import {IFPlugin} from '../types/plugin';

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

export const getParametersWithMetadata = (plugins: IFPlugin[]) => {
  return new Set<string>(
    plugins.flatMap(plugin => extractParametersWithMetadata(plugin))
  );
};

const extractParametersWithMetadata = (plugin: IFPlugin) => {
  if (!plugin['parameter-metadata']) return [];
  const {inputs, outputs} = plugin['parameter-metadata'];
  return [
    ...(inputs ? Object.keys(inputs) : []),
    ...(outputs ? Object.keys(outputs) : []),
  ];
};

const extractParameters = (
  config: Record<string, any> | undefined,
  keys: string[]
) => {
  if (!config) return [];
  return keys.flatMap(key => {
    if (key in config && typeof config[key] === 'string') {
      return config[key];
    }
    return [];
  });
};

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
