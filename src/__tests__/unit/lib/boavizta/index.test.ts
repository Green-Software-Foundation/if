import { describe, expect, jest, test } from '@jest/globals';
import {
  BoaviztaCloudoutputModel,
  BoaviztaCpuoutputModel,
} from '../../../../lib/boavizta/index';
import axios, { AxiosResponse } from 'axios';
import * as PROVIDERS from '../../../../__mocks__/boavizta/providers.json';
import * as COUNTRIES from '../../../../__mocks__/boavizta/countries.json';
import * as INSTANCE_TYPES from '../../../../__mocks__/boavizta/instance_types.json';

async function axiosGet<T = any, R = AxiosResponse<T, any>>(
  url: string
): Promise<R> {
  switch (url) {
    case 'https://api.boavizta.org/v1/cloud/instance/all_providers':
      return { data: PROVIDERS } as R;
    case 'https://api.boavizta.org/v1/utils/country_code':
      return Promise.resolve({ data: COUNTRIES } as R);
    case 'https://api.boavizta.org/v1/cloud/instance/all_instances?provider=aws':
      return Promise.resolve({
        data: INSTANCE_TYPES['aws'],
      } as R);
  }
  return Promise.resolve({} as R);
}

jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;
// Mock out all top level functions, such as get, put, delete and post:
mockAxios.get.mockImplementation(axiosGet);
mockAxios.post.mockImplementation(
  <T = any, R = AxiosResponse<T, any>>(url: string): Promise<R> => {
    switch (url) {
      case 'https://api.boavizta.org/v1/component/cpu?verbose=false&duration=1':
        return Promise.resolve({
          data: {
            outputs: {
              gwp: {
                embedded: {
                  value: 0.0008,
                  min: 0.0004155,
                  max: 0.003113,
                  warnings: ['End of life is not included in the calculation'],
                },
                use: { value: 0.06743, min: 0.06743, max: 0.06743 },
                unit: 'kgCO2eq',
                description: 'Total climate change',
              },
              adp: {
                embedded: {
                  value: 7.764e-7,
                  min: 7.763e-7,
                  max: 7.771e-7,
                  warnings: ['End of life is not included in the calculation'],
                },
                use: { value: 1.796e-8, min: 1.796e-8, max: 1.796e-8 },
                unit: 'kgSbeq',
                description: 'Use of minerals and fossil ressources',
              },
              pe: {
                embedded: {
                  value: 0.012,
                  min: 0.006847,
                  max: 0.04314,
                  warnings: ['End of life is not included in the calculation'],
                },
                use: { value: 2.07, min: 2.07, max: 2.07 },
                unit: 'MJ',
                description: 'Consumption of primary energy',
              },
            },
          },
        } as R);
      case 'https://api.boavizta.org/v1/component/cpu?verbose=true&duration=2':
        return Promise.resolve({
          data: {
            outputs: {
              gwp: {
                embedded: {
                  value: 0.0016,
                  min: 0.000831,
                  max: 0.006226,
                  warnings: ['End of life is not included in the calculation'],
                },
                use: { value: 0.1924, min: 0.1924, max: 0.1924 },
                unit: 'kgCO2eq',
                description: 'Total climate change',
              },
              adp: {
                embedded: {
                  value: 0.000001553,
                  min: 0.000001553,
                  max: 0.000001554,
                  warnings: ['End of life is not included in the calculation'],
                },
                use: { value: 5.126e-8, min: 5.126e-8, max: 5.126e-8 },
                unit: 'kgSbeq',
                description: 'Use of minerals and fossil ressources',
              },
              pe: {
                embedded: {
                  value: 0.023,
                  min: 0.01369,
                  max: 0.08627,
                  warnings: ['End of life is not included in the calculation'],
                },
                use: { value: 5.907, min: 5.907, max: 5.907 },
                unit: 'MJ',
                description: 'Consumption of primary energy',
              },
            },
            verbose: {
              outputs: {
                gwp: {
                  embedded: {
                    value: 0.0016,
                    min: 0.000831,
                    max: 0.006226,
                    warnings: [
                      'End of life is not included in the calculation',
                    ],
                  },
                  use: { value: 0.1924, min: 0.1924, max: 0.1924 },
                  unit: 'kgCO2eq',
                  description: 'Total climate change',
                },
                adp: {
                  embedded: {
                    value: 0.000001553,
                    min: 0.000001553,
                    max: 0.000001554,
                    warnings: [
                      'End of life is not included in the calculation',
                    ],
                  },
                  use: { value: 5.126e-8, min: 5.126e-8, max: 5.126e-8 },
                  unit: 'kgSbeq',
                  description: 'Use of minerals and fossil ressources',
                },
                pe: {
                  embedded: {
                    value: 0.023,
                    min: 0.01369,
                    max: 0.08627,
                    warnings: [
                      'End of life is not included in the calculation',
                    ],
                  },
                  use: { value: 5.907, min: 5.907, max: 5.907 },
                  unit: 'MJ',
                  description: 'Consumption of primary energy',
                },
              },
              units: { value: 1, status: 'ARCHETYPE', min: 1, max: 1 },
              die_size: {
                value: 521,
                status: 'COMPLETED',
                unit: 'mm2',
                source: 'Average value for all families',
                min: 41.2,
                max: 3640,
              },
              duration: { value: 2, unit: 'hours' },
              avg_power: {
                value: 260.05,
                status: 'COMPLETED',
                unit: 'W',
                min: 260.05,
                max: 260.05,
              },
              time_workload: { value: 100, status: 'INPUT', unit: '%' },
              usage_location: {
                value: 'USA',
                status: 'INPUT',
                unit: 'CodSP3 - NCS Country Codes - NATO',
              },
              use_time_ratio: {
                value: 1,
                status: 'ARCHETYPE',
                unit: '/1',
                min: 1,
                max: 1,
              },
              hours_life_time: {
                value: 26280,
                status: 'ARCHETYPE',
                unit: 'hours',
                min: 26280,
                max: 26280,
              },
              params: {
                value: { a: 171.2, b: 0.0354, c: 36.89, d: -10.13 },
                status: 'ARCHETYPE',
              },
              gwp_factor: {
                value: 0.37,
                status: 'COMPLETED',
                unit: 'kg CO2eq/kWh',
                source: 'https://ember-climate.org/data/data-explorer',
                min: 0.37,
                max: 0.37,
              },
              adp_factor: {
                value: 9.85548e-8,
                status: 'COMPLETED',
                unit: 'kg Sbeq/kWh',
                source: 'ADEME Base outputS ®',
                min: 9.85548e-8,
                max: 9.85548e-8,
              },
              pe_factor: {
                value: 11.358,
                status: 'COMPLETED',
                unit: 'MJ/kWh',
                source: 'ADPf / (1-%renewable_energy)',
                min: 11.358,
                max: 11.358,
              },
            },
          },
        } as R);
      case 'https://api.boavizta.org/v1/cloud/instance?verbose=false&duration=0.004166666666666667':
        return Promise.resolve({
          data: {
            outputs: {
              gwp: {
                embedded: {
                  value: 0.0016,
                  min: 0.000831,
                  max: 0.006226,
                  warnings: ['End of life is not included in the calculation'],
                },
                use: { value: 0.1924, min: 0.1924, max: 0.1924 },
                unit: 'kgCO2eq',
                description: 'Total climate change',
              },
              adp: {
                embedded: {
                  value: 0.000001553,
                  min: 0.000001553,
                  max: 0.000001554,
                  warnings: ['End of life is not included in the calculation'],
                },
                use: { value: 5.126e-8, min: 5.126e-8, max: 5.126e-8 },
                unit: 'kgSbeq',
                description: 'Use of minerals and fossil ressources',
              },
              pe: {
                embedded: {
                  value: 0.023,
                  min: 0.01369,
                  max: 0.08627,
                  warnings: ['End of life is not included in the calculation'],
                },
                use: { value: 5.907, min: 5.907, max: 5.907 },
                unit: 'MJ',
                description: 'Consumption of primary energy',
              },
            },
            verbose: {
              outputs: {
                gwp: {
                  embedded: {
                    value: 0.0016,
                    min: 0.000831,
                    max: 0.006226,
                    warnings: [
                      'End of life is not included in the calculation',
                    ],
                  },
                  use: { value: 0.1924, min: 0.1924, max: 0.1924 },
                  unit: 'kgCO2eq',
                  description: 'Total climate change',
                },
                adp: {
                  embedded: {
                    value: 0.000001553,
                    min: 0.000001553,
                    max: 0.000001554,
                    warnings: [
                      'End of life is not included in the calculation',
                    ],
                  },
                  use: { value: 5.126e-8, min: 5.126e-8, max: 5.126e-8 },
                  unit: 'kgSbeq',
                  description: 'Use of minerals and fossil ressources',
                },
                pe: {
                  embedded: {
                    value: 0.023,
                    min: 0.01369,
                    max: 0.08627,
                    warnings: [
                      'End of life is not included in the calculation',
                    ],
                  },
                  use: { value: 5.907, min: 5.907, max: 5.907 },
                  unit: 'MJ',
                  description: 'Consumption of primary energy',
                },
              },
              units: { value: 1, status: 'ARCHETYPE', min: 1, max: 1 },
              die_size: {
                value: 521,
                status: 'COMPLETED',
                unit: 'mm2',
                source: 'Average value for all families',
                min: 41.2,
                max: 3640,
              },
              duration: { value: 2, unit: 'hours' },
              avg_power: {
                value: 260.05,
                status: 'COMPLETED',
                unit: 'W',
                min: 260.05,
                max: 260.05,
              },
              time_workload: { value: 100, status: 'INPUT', unit: '%' },
              usage_location: {
                value: 'USA',
                status: 'INPUT',
                unit: 'CodSP3 - NCS Country Codes - NATO',
              },
              use_time_ratio: {
                value: 1,
                status: 'ARCHETYPE',
                unit: '/1',
                min: 1,
                max: 1,
              },
              hours_life_time: {
                value: 26280,
                status: 'ARCHETYPE',
                unit: 'hours',
                min: 26280,
                max: 26280,
              },
              params: {
                value: { a: 171.2, b: 0.0354, c: 36.89, d: -10.13 },
                status: 'ARCHETYPE',
              },
              gwp_factor: {
                value: 0.37,
                status: 'COMPLETED',
                unit: 'kg CO2eq/kWh',
                source: 'https://ember-climate.org/data/data-explorer',
                min: 0.37,
                max: 0.37,
              },
              adp_factor: {
                value: 9.85548e-8,
                status: 'COMPLETED',
                unit: 'kg Sbeq/kWh',
                source: 'ADEME Base outputS ®',
                min: 9.85548e-8,
                max: 9.85548e-8,
              },
              pe_factor: {
                value: 11.358,
                status: 'COMPLETED',
                unit: 'MJ/kWh',
                source: 'ADPf / (1-%renewable_energy)',
                min: 11.358,
                max: 11.358,
              },
            },
          },
        } as R);
    }
    return Promise.resolve({} as R);
  }
);
jest.setTimeout(30000);
describe('cpu:configure test', () => {
  test('initialize wrong params should throw error', async () => {
    const outputModel = new BoaviztaCpuOutputModel();
    await expect(
      outputModel.configure('test', { allocation: 'wrong' })
    ).rejects.toThrowError();
    expect(outputModel.name).toBe('test');
  });

  test('initialize without params throws error for parameter and call execute without params throws error for input', async () => {
    const outputModel = new BoaviztaCpuOutputModel();
    const outputModelConfigFail = new BoaviztaCpuOutputModel();
    expect(outputModel.modelIdentifier()).toBe('org.boavizta.cpu.sci');
    await expect(outputModel.authenticate({})).resolves.toBe(undefined);
    await expect(
      outputModelConfigFail.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          duration: 3600,
          'cpu-util': 50,
        },
      ])
    ).rejects.toThrowError();

    await expect(outputModel.configure('test')).rejects.toThrow(
      Error('Improper configure: Missing processor parameter')
    );
    await expect(
      outputModel.configure('test', {
        'physical-processor': 'Intel Xeon Gold 6138f',
      })
    ).rejects.toThrow(
      Error('Improper configure: Missing core-units parameter')
    );
    await expect(
      outputModel.configure('test', {
        'physical-processor': 'Intel Xeon Gold 6138f',
        'core-units': 24,
        'expected-lifespan': 4 * 365 * 24 * 60 * 60,
      })
    ).resolves.toBeInstanceOf(BoaviztaCpuoutputModel);
    expect(outputModel.name).toBe('test');
    // not providing inputs will throw a missing inputs error
    await expect(outputModel.execute()).rejects.toStrictEqual(
      Error(
        'Parameter Not Given: invalid inputs parameter. Expecting an array of inputs'
      )
    );
    // improper inputs will throw an invalid inputs error
    await expect(
      outputModel.execute([{ invalid: 'input' }])
    ).rejects.toStrictEqual(Error('Invalid Input: Invalid inputs parameter'));
  });
});

describe('cpu:initialize with params', () => {
  test('initialize with params and call multiple usages in IMPL format', async () => {
    const outputModel = new BoaviztaCpuOutputModel();
    await expect(
      outputModel.configure('test', {
        'physical-processor': 'Intel Xeon Gold 6138f',
        'core-units': 24,
        location: 'USA',
      })
    ).resolves.toBeInstanceOf(BoaviztaCpuoutputModel);
    expect(outputModel.name).toBe('test');
    // configure without static params will cause improper configure error
    await expect(
      outputModel.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          duration: 3600,
          'cpu-util': 50,
        },
      ])
    ).resolves.toStrictEqual([
      {
        'embodied-carbon': 0.8,
        'e-cpu': 0.575,
      },
    ]);
  });
  test('initialize with params and call multiple usages in IMPL format:verbose', async () => {
    const outputModel = new BoaviztaCpuOutputModel();
    await expect(
      outputModel.configure('test', {
        'physical-processor': 'Intel Xeon Gold 6138f',
        'core-units': 24,
        location: 'USA',
        verbose: true,
      })
    ).resolves.toBeInstanceOf(BoaviztaCpuoutputModel);
    expect(outputModel.name).toBe('test');
    // configure without static params will cause improper configure error
    await expect(
      outputModel.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          duration: 7200,
          'cpu-util': 100,
        },
      ])
    ).resolves.toStrictEqual([
      {
        'embodied-carbon': 1.6,
        'e-cpu': 1.6408333333333334,
      },
    ]);
  });
});

describe('cloud:initialize with params', () => {
  test('initialize with params and call usage in RAW Format', async () => {
    const outputModel = new BoaviztaCloudoutputModel();
    expect(outputModel.modelIdentifier()).toBe('org.boavizta.cloud.sci');
    await expect(
      outputModel.validateLocation({ location: 'SomethingFail' })
    ).rejects.toThrowError();
    await expect(
      outputModel.validateInstanceType({ 'instance-type': 'SomethingFail' })
    ).rejects.toThrowError();
    await expect(
      outputModel.validateProvider({ provider: 'SomethingFail' })
    ).rejects.toThrowError();
    await expect(
      outputModel.configure('test', {
        'instance-type': 't2.micro',
        location: 'USA',
        'expected-lifespan': 4 * 365 * 24 * 60 * 60,
        provider: 'aws',
        verbose: false,
      })
    ).resolves.toBeInstanceOf(BoaviztaCloudoutputModel);
    await expect(
      outputModel.configure('test', {
        'instance-type': 't2.micro',
        location: 'USA',
        'expected-lifespan': 4 * 365 * 24 * 60 * 60,
        provider: 'aws',
        verbose: 'false',
      })
    ).resolves.toBeInstanceOf(BoaviztaCloudoutputModel);
    await expect(
      outputModel.configure('test', {
        'instance-type': 't2.micro',
        location: 'USA',
        'expected-lifespan': 4 * 365 * 24 * 60 * 60,
        provider: 'aws',
        verbose: 0,
      })
    ).resolves.toBeInstanceOf(BoaviztaCloudoutputModel);
    expect(outputModel.name).toBe('test');
    // configure without static params will cause improper configure error
  });

  test("correct 'instance-type': initialize with params and call usage in IMPL Format", async () => {
    const outputModel = new BoaviztaCloudoutputModel();

    await expect(
      outputModel.configure('test', {
        'instance-type': 't2.micro',
        location: 'USA',
      })
    ).rejects.toThrowError();
    await expect(
      outputModel.configure('test', {
        provider: 'aws',
        location: 'USA',
      })
    ).rejects.toThrowError();
    await expect(
      outputModel.configure('test', {
        'instance-type': 't2.micro',
        location: 'USA',
        provider: 'aws',
      })
    ).resolves.toBeInstanceOf(BoaviztaCloudoutputModel);
    expect(outputModel.name).toBe('test');
    // mockAxios.get.mockResolvedValue({data: {}});
    await expect(
      outputModel.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          duration: 15,
          'cpu-util': 34,
        },
      ])
    ).resolves.toStrictEqual([
      {
        'embodied-carbon': 1.6,
        energy: 1.6408333333333334,
      },
    ]);
  });

  test('wrong "instance-type": initialize with params and call usage in IMPL Format throws error', async () => {
    const outputModel = new BoaviztaCloudoutputModel();

    await expect(
      outputModel.configure('test', {
        'instance-type': 't5.micro',
        location: 'USA',
        provider: 'aws',
      })
    ).rejects.toThrowError();
    expect(outputModel.name).toBe('test');
    // configure without static params will cause improper configure error
    await expect(
      outputModel.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          duration: 15,
          'cpu-util': 34,
        },
        {
          timestamp: '2021-01-01T00:00:15Z',
          duration: 15,
          'cpu-util': 12,
        },
        {
          timestamp: '2021-01-01T00:00:30Z',
          duration: 15,
          'cpu-util': 1,
        },
        {
          timestamp: '2021-01-01T00:00:45Z',
          duration: 15,
          'cpu-util': 78,
        },
      ])
    ).rejects.toThrowError();
  });

  test('without "instance-type": initialize with params and call usage in IMPL Format throws error', async () => {
    const outputModel = new BoaviztaCloudoutputModel();

    await expect(
      outputModel.configure('test', {
        location: 'USA',
        provider: 'aws',
      })
    ).rejects.toStrictEqual(
      Error("Improper configure: Missing 'instance-type' parameter")
    );
    await expect(
      outputModel.configure('test', {
        location: 'USAF',
        provider: 'aws',
        'instance-type': 't2.micro',
      })
    ).rejects.toThrowError();
    expect(outputModel.name).toBe('test');
    // configure without static params will cause improper configure error
    await expect(
      outputModel.execute([
        {
          timestamp: '2021-01-01T00:00:00Z',
          duration: 15,
          'cpu-util': 34,
        },
        {
          timestamp: '2021-01-01T00:00:15Z',
          duration: 15,
          'cpu-util': 12,
        },
        {
          timestamp: '2021-01-01T00:00:30Z',
          duration: 15,
          'cpu-util': 1,
        },
        {
          timestamp: '2021-01-01T00:00:45Z',
          duration: 15,
          'cpu-util': 78,
        },
      ])
    ).rejects.toStrictEqual(
      Error('Improper configure: Missing configuration parameters')
    );
  });
});
