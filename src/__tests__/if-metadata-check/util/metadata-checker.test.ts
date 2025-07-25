import * as metadataChecker from '../../../if-metadata-check/util/metadata-checker';
import {IFPlugin} from '../../../if-metadata-check/types/plugin';

describe('metadata-checker', () => {
  describe('extractParametersWithMetadata', () => {
    test('should return parameters that have metadata from a plugin', () => {
      const plugin: IFPlugin = {
        path: 'mock-path',
        method: 'MockMethod',
        config: {
          'input-parameter': 'mock_input_parameter',
          output: 'mock_output_parameter',
        },
        'parameter-metadata': {
          inputs: {
            mock_input_parameter: {
              description: 'Mock description for parameter',
              unit: 'mock_unit',
              'aggregation-method': {
                time: 'sum',
                component: 'sum',
              },
            },
          },
          outputs: {},
        },
      };
      const result = metadataChecker.extractParametersWithMetadata(plugin);
      const expectedResult = ['mock_input_parameter'];
      expect(result).toEqual(expectedResult);
    });
    test('should return an empty array if no parameters have metadata', () => {
      const plugin: IFPlugin = {
        path: 'mock-path',
        method: 'MockMethod',
        config: {
          'input-parameter': 'mock_input_parameter',
          output: 'mock_output_parameter',
        },
      };
      const result = metadataChecker.extractParametersWithMetadata(plugin);
      expect(result[0]).toBeUndefined();
    });
  });
  describe('calculateMetadataCoverage', () => {
    test('should return the coverage percentage and missing parameters', () => {
      const parameterSet = new Set<string>([
        'mock_parameter_1',
        'mock_parameter_2',
      ]);
      const parameterWithMetadataSet = new Set<string>(['mock_parameter_1']);
      const expectedResult = {
        percentage: 50,
        missingParameters: ['mock_parameter_2'],
      };
      const result = metadataChecker.calculateMetadataCoverage(
        parameterSet,
        parameterWithMetadataSet
      );
      expect(result).toEqual(expectedResult);
    });
    test('should return full coverage when parameterSet is empty', () => {
      const parameterSet = new Set<string>();
      const parameterWithMetadataSet = new Set<string>();
      const result = metadataChecker.calculateMetadataCoverage(
        parameterSet,
        parameterWithMetadataSet
      );
      const expectedResult = {percentage: 100, missingParameters: []};
      expect(result).toEqual(expectedResult);
    });
  });
  describe('extractParameters', () => {
    test('should return an empty array if config is not provided', () => {
      const result = metadataChecker.extractParameters({}, []);
      expect(result[0]).toBeUndefined();
    });
    test('should extract the parameters from the plugin configuration', () => {
      const config = {
        'input-parameters': [
          'mock_input_parameter_1',
          'mock_input_parameter_2',
        ],
        output: 'mock_output_parameter',
      };
      const expectedResult = [
        'mock_input_parameter_1',
        'mock_input_parameter_2',
      ];
      const result = metadataChecker.extractParameters(config, [
        'input-parameters',
      ]);
      expect(result).toEqual(expectedResult);
    });
    test('should not extract non string parameters', () => {
      const config = {
        'input-parameter': 1000,
        output: ['mock_output_parameter', 50],
      };
      const result = metadataChecker.extractParameters(config, [
        'input-parameters',
        'output',
      ]);
      expect(result[0]).toBeUndefined();
    });
  });
  describe('getParameters', () => {
    test('should call extractParameters with each plugin', () => {
      const spy = jest.spyOn(metadataChecker, 'extractParameters');
      const plugins: IFPlugin[] = [
        {
          path: 'mock-path-1',
          method: 'MockMethod1',
          config: {
            'input-parameter': 'mock_input_parameter_1',
            output: 'mock_output_parameter',
          },
        },

        {
          path: 'mock-path-2',
          method: 'MockMethod2',
          config: {
            'input-parameter': 'mock_input_parameter_2',
            output: 'mock_output_parameter',
          },
        },
      ];
      metadataChecker.getParameters(plugins, []);
      expect(spy).toHaveBeenCalledTimes(plugins.length);
    });
  });
  describe('getParametersWithMetadata', () => {
    test('should class extractParametersWithMetadata with each plugin', () => {
      const spy = jest.spyOn(metadataChecker, 'extractParametersWithMetadata');
      const plugins: IFPlugin[] = [
        {
          path: 'mock-path-1',
          method: 'MockMethod1',
          config: {
            'input-parameter': 'mock_input_parameter_1',
            output: 'mock_output_parameter',
          },
        },

        {
          path: 'mock-path-2',
          method: 'MockMethod2',
          config: {
            'input-parameter': 'mock_input_parameter_2',
            output: 'mock_output_parameter',
          },
        },
      ];
      metadataChecker.getParametersWithMetadata(plugins);
      expect(spy).toHaveBeenCalledTimes(plugins.length);
    });
  });
});
