import {describe, expect, jest, test} from '@jest/globals';
import {
  BoaviztaCloudImpactModel,
  BoaviztaCpuImpactModel,
} from '../../../../lib/boavizta/index';
import axios, {AxiosResponse} from 'axios';
import * as PROVIDERS from '../../../../__mocks__/boavizta/providers.json';
import * as COUNTRIES from '../../../../__mocks__/boavizta/countries.json';
import * as INSTANCE_TYPES from '../../../../__mocks__/boavizta/instance_types.json';

async function axiosGet<T = any, R = AxiosResponse<T, any>>(
  url: string
): Promise<R> {
  switch (url) {
    case 'https://api.boavizta.org/v1/cloud/all_providers':
      return {data: PROVIDERS} as R;
    case 'https://api.boavizta.org/v1/utils/country_code':
      return Promise.resolve({data: COUNTRIES} as R);
    case 'https://api.boavizta.org/v1/cloud/all_instances?provider=aws':
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
      case 'https://api.boavizta.org/v1/component/cpu?verbose=false&allocation=LINEAR':
        return Promise.resolve({
          data: {
            gwp: {manufacture: 0.1, use: 1.0, unit: 'kgCO2eq'},
            pe: {manufacture: 0.1, use: 1.0, unit: 'MJ'},
          },
        } as R);
      case 'https://api.boavizta.org/v1/component/cpu?verbose=true&allocation=LINEAR':
        return Promise.resolve({
          data: {
            impacts: {
              gwp: {manufacture: 0.1, use: 1.0, unit: 'kgCO2eq'},
              pe: {manufacture: 0.1, use: 1.0, unit: 'MJ'},
            },
          },
        } as R);
      case 'https://api.boavizta.org/v1/cloud/?verbose=false&allocation=LINEAR':
        return Promise.resolve({
          data: {
            gwp: {manufacture: 0.1, use: 1.0, unit: 'kgCO2eq'},
            pe: {manufacture: 0.1, use: 1.0, unit: 'MJ'},
          },
        } as R);
    }
    return Promise.resolve({} as R);
  }
);
jest.setTimeout(30000);
describe('cpu:configure test', () => {
  test('initialize wrong params should throw error', async () => {
    const impactModel = new BoaviztaCpuImpactModel();
    await expect(
      impactModel.configure('test', {allocation: 'wrong'})
    ).rejects.toThrowError();
    expect(impactModel.name).toBe('test');
  });

  test('initialize without params throws error for parameter and call calculate without params throws error for observation', async () => {
    const impactModel = new BoaviztaCpuImpactModel();
    const impactModelConfigFail = new BoaviztaCpuImpactModel();
    expect(impactModel.modelIdentifier()).toBe('org.boavizta.cpu.sci');
    await expect(impactModel.authenticate({})).resolves.toBe(undefined);
    await expect(
      impactModelConfigFail.calculate([
        {
          timestamp: '2021-01-01T00:00:00Z',
          duration: 3600,
          'cpu-util': 0.5,
        },
      ])
    ).rejects.toThrowError();

    await expect(impactModel.configure('test')).rejects.toThrow(
      Error('Improper configure: Missing processor parameter')
    );
    await expect(
      impactModel.configure('test', {
        processor: 'Intel Xeon Gold 6138f',
      })
    ).rejects.toThrow(
      Error('Improper configure: Missing core-units parameter')
    );
    await expect(
      impactModel.configure('test', {
        processor: 'Intel Xeon Gold 6138f',
        'core-units': 24,
        'expected-lifespan': 4 * 365 * 24 * 60 * 60,
      })
    ).resolves.toBeInstanceOf(BoaviztaCpuImpactModel);
    expect(impactModel.name).toBe('test');
    // not providing observations will throw a missing observations error
    await expect(impactModel.calculate()).rejects.toStrictEqual(
      Error(
        'Parameter Not Given: invalid observations parameter. Expecting an array of observations'
      )
    );
    // improper observations will throw an invalid observations error
    await expect(
      impactModel.calculate([{invalid: 'observation'}])
    ).rejects.toStrictEqual(
      Error('Invalid Input: Invalid observations parameter')
    );
  });
});

describe('cpu:initialize with params', () => {
  test('initialize with params and call multiple usages in IMPL format', async () => {
    const impactModel = new BoaviztaCpuImpactModel();
    await expect(
      impactModel.configure('test', {
        processor: 'Intel Xeon Gold 6138f',
        'core-units': 24,
        location: 'USA',
      })
    ).resolves.toBeInstanceOf(BoaviztaCpuImpactModel);
    expect(impactModel.name).toBe('test');
    // configure without static params will cause improper configure error
    await expect(
      impactModel.calculate([
        {
          timestamp: '2021-01-01T00:00:00Z',
          duration: 3600,
          'cpu-util': 50,
        },
      ])
    ).resolves.toStrictEqual([
      {
        'embodied-carbon': 100,
        'e-cpu': 0.2777777777777778,
      },
    ]);
  });
  test('initialize with params and call multiple usages in IMPL format:verbose', async () => {
    const impactModel = new BoaviztaCpuImpactModel();
    await expect(
      impactModel.configure('test', {
        processor: 'Intel Xeon Gold 6138f',
        'core-units': 24,
        location: 'USA',
        verbose: true,
      })
    ).resolves.toBeInstanceOf(BoaviztaCpuImpactModel);
    expect(impactModel.name).toBe('test');
    // configure without static params will cause improper configure error
    await expect(
      impactModel.calculate([
        {
          timestamp: '2021-01-01T00:00:00Z',
          duration: 3600,
          'cpu-util': 0.5,
        },
      ])
    ).resolves.toStrictEqual([
      {
        'embodied-carbon': 100,
        'e-cpu': 0.2777777777777778,
      },
    ]);
  });
});

describe('cloud:initialize with params', () => {
  test('initialize with params and call usage in RAW Format', async () => {
    const impactModel = new BoaviztaCloudImpactModel();
    expect(impactModel.modelIdentifier()).toBe('org.boavizta.cloud.sci');
    await expect(
      impactModel.validateLocation({location: 'SomethingFail'})
    ).rejects.toThrowError();
    await expect(
      impactModel.validateInstanceType({'instance-type': 'SomethingFail'})
    ).rejects.toThrowError();
    await expect(
      impactModel.validateProvider({provider: 'SomethingFail'})
    ).rejects.toThrowError();
    await expect(
      impactModel.configure('test', {
        'instance-type': 't2.micro',
        location: 'USA',
        'expected-lifespan': 4 * 365 * 24 * 60 * 60,
        provider: 'aws',
        verbose: false,
      })
    ).resolves.toBeInstanceOf(BoaviztaCloudImpactModel);
    await expect(
      impactModel.configure('test', {
        'instance-type': 't2.micro',
        location: 'USA',
        'expected-lifespan': 4 * 365 * 24 * 60 * 60,
        provider: 'aws',
        verbose: 'false',
      })
    ).resolves.toBeInstanceOf(BoaviztaCloudImpactModel);
    await expect(
      impactModel.configure('test', {
        'instance-type': 't2.micro',
        location: 'USA',
        'expected-lifespan': 4 * 365 * 24 * 60 * 60,
        provider: 'aws',
        verbose: 0,
      })
    ).resolves.toBeInstanceOf(BoaviztaCloudImpactModel);
    expect(impactModel.name).toBe('test');
    // configure without static params will cause improper configure error
  });

  test("correct 'instance-type': initialize with params and call usage in IMPL Format", async () => {
    const impactModel = new BoaviztaCloudImpactModel();

    await expect(
      impactModel.configure('test', {
        'instance-type': 't2.micro',
        location: 'USA',
      })
    ).rejects.toThrowError();
    await expect(
      impactModel.configure('test', {
        provider: 'aws',
        location: 'USA',
      })
    ).rejects.toThrowError();
    await expect(
      impactModel.configure('test', {
        'instance-type': 't2.micro',
        location: 'USA',
        provider: 'aws',
      })
    ).resolves.toBeInstanceOf(BoaviztaCloudImpactModel);
    expect(impactModel.name).toBe('test');
    // mockAxios.get.mockResolvedValue({data: {}});
    await expect(
      impactModel.calculate([
        {
          timestamp: '2021-01-01T00:00:00Z',
          duration: 15,
          'cpu-util': 34,
        },
      ])
    ).resolves.toStrictEqual([
      {
        'embodied-carbon': 100,
        energy: 0.2777777777777778,
      },
    ]);
  });

  test('wrong "instance-type": initialize with params and call usage in IMPL Format throws error', async () => {
    const impactModel = new BoaviztaCloudImpactModel();

    await expect(
      impactModel.configure('test', {
        'instance-type': 't5.micro',
        location: 'USA',
        provider: 'aws',
      })
    ).rejects.toThrowError();
    expect(impactModel.name).toBe('test');
    // configure without static params will cause improper configure error
    await expect(
      impactModel.calculate([
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
    const impactModel = new BoaviztaCloudImpactModel();

    await expect(
      impactModel.configure('test', {
        location: 'USA',
        provider: 'aws',
      })
    ).rejects.toStrictEqual(
      Error("Improper configure: Missing 'instance-type' parameter")
    );
    await expect(
      impactModel.configure('test', {
        location: 'USAF',
        provider: 'aws',
        'instance-type': 't2.micro',
      })
    ).rejects.toThrowError();
    expect(impactModel.name).toBe('test');
    // configure without static params will cause improper configure error
    await expect(
      impactModel.calculate([
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
