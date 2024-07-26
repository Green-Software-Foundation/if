import {explain, addExplainData} from '../../../if-run/lib/explain';

describe('lib/explain: ', () => {
  it('successfully adds explain data if `inputs` and `outputs` of `metadata` are `undefined`.', () => {
    const mockData = {
      pluginName: 'divide',
      metadata: {kind: 'execute', inputs: undefined, outputs: undefined},
      pluginData: {
        path: 'builtin',
        method: 'Divide',
      },
    };
    const expectedResult = {
      divide: {
        method: 'Divide',
        path: 'builtin',
        inputs: 'undefined',
        outputs: 'undefined',
      },
    };

    addExplainData(mockData);
    const result = explain();
    expect.assertions(1);
    expect(result).toEqual(expectedResult);
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
          },
          'network/energy': {
            unit: 'kWh',
            description: 'energy consumed by data ingress and egress',
          },
        },
        outputs: {
          'energy-sum': {
            unit: 'kWh',
            description: 'sum of energy components',
          },
        },
      },
      pluginData: {
        path: 'builtin',
        method: 'Sum',
      },
    };
    const expectedResult = {
      divide: {
        method: 'Divide',
        path: 'builtin',
        inputs: 'undefined',
        outputs: 'undefined',
      },
      sum: {
        method: 'Sum',
        path: 'builtin',
        inputs: {
          'cpu/energy': {
            unit: 'kWh',
            description: 'energy consumed by the cpu',
          },
          'network/energy': {
            unit: 'kWh',
            description: 'energy consumed by data ingress and egress',
          },
        },
        outputs: {
          'energy-sum': {unit: 'kWh', description: 'sum of energy components'},
        },
      },
    };

    addExplainData(mockData);
    const result = explain();
    expect.assertions(1);
    expect(result).toEqual(expectedResult);
  });
});
