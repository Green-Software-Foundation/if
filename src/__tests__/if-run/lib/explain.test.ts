/* eslint-disable @typescript-eslint/ban-ts-comment */
import {ERRORS} from '@grnsft/if-core/utils';

import {STRINGS} from '../../../common/config';

import {explain, addExplainData} from '../../../if-run/lib/explain';

const {ManifestValidationError} = ERRORS;
const {AGGREGATION_UNITS_NOT_MATCH, AGGREGATION_METHODS_NOT_MATCH} = STRINGS;

describe('lib/explain: ', () => {
  it('missing explain data if `inputs` and `outputs` of `metadata` are `undefined`.', () => {
    const mockData = {
      pluginName: 'divide',
      metadata: {kind: 'execute', inputs: undefined, outputs: undefined},
    };

    addExplainData(mockData);
    const result = explain();
    expect.assertions(1);
    expect(result).toEqual({});
  });

  it('successfully adds explain data if `inputs` and `outputs` of `metadata` are valid data.', () => {
    const mockData = {
      pluginName: 'sum',
      metadata: {
        kind: 'execute',
        inputs: {
          'cpu/energy': {
            unit: 'kWh',
            description: 'energy consumed by the cpu',
            'aggregation-method': 'sum',
          },
          'network/energy': {
            unit: 'kWh',
            description: 'energy consumed by data ingress and egress',
            'aggregation-method': 'sum',
          },
        },
        outputs: {
          'energy-sum': {
            unit: 'kWh',
            description: 'sum of energy components',
            'aggregation-method': 'sum',
          },
        },
      },
    };

    const expectedResult = {
      sum: {
        inputs: {
          'cpu/energy': {
            unit: 'kWh',
            description: 'energy consumed by the cpu',
            'aggregation-method': 'sum',
          },
          'network/energy': {
            unit: 'kWh',
            description: 'energy consumed by data ingress and egress',
            'aggregation-method': 'sum',
          },
        },
        outputs: {
          'energy-sum': {
            unit: 'kWh',
            description: 'sum of energy components',
            'aggregation-method': 'sum',
          },
        },
      },
    };

    // @ts-ignore
    addExplainData(mockData);

    const result = explain();

    expect.assertions(1);
    expect(result).toEqual(expectedResult);
  });

  it('successfully adds explain data if the parameter is using more than one plugin.', () => {
    const mockData = {
      pluginName: 'sum-energy',
      metadata: {
        kind: 'execute',
        inputs: {
          'cpu/energy': {
            unit: 'kWh',
            description: 'energy consumed by the cpu',
            'aggregation-method': 'sum',
          },
          'memory/energy': {
            unit: 'kWh',
            description: 'energy consumed by data from memory',
            'aggregation-method': 'sum',
          },
        },
        outputs: {
          'total/energy': {
            unit: 'kWh',
            description: 'sum of energy components',
            'aggregation-method': 'sum',
          },
        },
      },
    };

    const expectedResult = {
      sum: {
        inputs: {
          'cpu/energy': {
            unit: 'kWh',
            description: 'energy consumed by the cpu',
            'aggregation-method': 'sum',
          },
          'network/energy': {
            unit: 'kWh',
            description: 'energy consumed by data ingress and egress',
            'aggregation-method': 'sum',
          },
        },
        outputs: {
          'energy-sum': {
            unit: 'kWh',
            description: 'sum of energy components',
            'aggregation-method': 'sum',
          },
        },
      },
      'sum-energy': {
        inputs: {
          'cpu/energy': {
            unit: 'kWh',
            description: 'energy consumed by the cpu',
            'aggregation-method': 'sum',
          },
          'memory/energy': {
            unit: 'kWh',
            description: 'energy consumed by data from memory',
            'aggregation-method': 'sum',
          },
        },
        outputs: {
          'total/energy': {
            unit: 'kWh',
            description: 'sum of energy components',
            'aggregation-method': 'sum',
          },
        },
      },
    };

    // @ts-ignore
    addExplainData(mockData);

    const result = explain();

    expect.assertions(1);
    expect(result).toEqual(expectedResult);
  });

  it('throws an error if `unit` of the parameter is not matched.', () => {
    const mockData = {
      pluginName: 'sum-of-energy',
      metadata: {
        kind: 'execute',
        inputs: {
          'cpu/energy': {
            unit: 'co2q',
            description: 'energy consumed by the cpu',
            'aggregation-method': 'sum',
          },
          'memory/energy': {
            unit: 'kWh',
            description: 'energy consumed by data from memory',
            'aggregation-method': 'sum',
          },
        },
        outputs: {
          'total/energy': {
            unit: 'kWh',
            description: 'sum of energy components',
            'aggregation-method': 'sum',
          },
        },
      },
    };

    expect.assertions(2);
    try {
      // @ts-ignore
      addExplainData(mockData);
      explain();
    } catch (error) {
      if (error instanceof Error) {
        expect(error).toBeInstanceOf(ManifestValidationError);
        expect(error.message).toEqual(
          AGGREGATION_UNITS_NOT_MATCH('cpu/energy')
        );
      }
    }
  });

  it('throws an error if `aggregation-method` of the parameter is not matched.', () => {
    const mockData = {
      pluginName: 'sum-of-energy',
      metadata: {
        kind: 'execute',
        inputs: {
          'cpu/energy': {
            unit: 'kWh',
            description: 'energy consumed by the cpu',
            'aggregation-method': {
              time: 'avg',
              component: 'avg',
            },
          },
          'memory/energy': {
            unit: 'kWh',
            description: 'energy consumed by data from memory',
            'aggregation-method': {
              time: 'sum',
              component: 'sum',
            },
          },
        },
        outputs: {
          'total/energy': {
            unit: 'kWh',
            description: 'sum of energy components',
            'aggregation-method': {
              time: 'sum',
              component: 'sum',
            },
          },
        },
      },
    };

    expect.assertions(2);
    try {
      // @ts-ignore
      addExplainData(mockData);
      explain();
    } catch (error) {
      if (error instanceof Error) {
        expect(error).toBeInstanceOf(ManifestValidationError);
        expect(error.message).toEqual(
          AGGREGATION_METHODS_NOT_MATCH('cpu/energy')
        );
      }
    }
  });
});
