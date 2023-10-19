import {describe, expect, jest, test} from '@jest/globals';
import {CloudCarbonFootprint} from '../../../../lib/ccf/index';

jest.setTimeout(30000);

describe('ccf:configure test', () => {
  test('initialize with params', async () => {
    const impactModel = new CloudCarbonFootprint();

    await expect(
      impactModel.configure('test', {
        vendor: 'aws2',
        'instance-type': 't2.micro',
      })
    ).rejects.toThrowError();
    expect(impactModel.resolveAwsArchitecture('Graviton')).toStrictEqual(
      'Graviton'
    );
    try {
      impactModel.resolveAwsArchitecture('Gra2');
    } catch (e: any) {
      expect(e.message).toBe('Gra2 not supported');
    }
    await impactModel.configure('test', {
      vendor: 'aws',
      'instance-type': 't2.micro',
    });
    await expect(
      impactModel.calculate([
        {duration: 3600, 'cpu-util': 50, timestamp: '2021-01-01T00:00:00Z'},
      ])
    ).resolves.toStrictEqual([
      {
        duration: 3600,
        'cpu-util': 50,
        timestamp: '2021-01-01T00:00:00Z',
        energy: 0.0023031270462730543,
        'embodied-carbon': 0.04216723744292237 * 1000,
      },
    ]);
    await impactModel.configure('test', {
      vendor: 'aws',
      interpolation: 'spline',
      'instance-type': 't2.micro',
    });
    await expect(
      impactModel.calculate([
        {duration: 3600, 'cpu-util': 50, timestamp: '2021-01-01T00:00:00Z'},
      ])
    ).resolves.toStrictEqual([
      {
        'cpu-util': 50,
        timestamp: '2021-01-01T00:00:00Z',
        duration: 3600,
        'embodied-carbon': 42.16723744292237,
        energy: 0.004900000000000001,
      },
    ]);
    await expect(impactModel.calculate(undefined)).rejects.toThrowError();
    await expect(impactModel.calculate({})).rejects.toThrowError();
  });
  test('initialize with params:aws', async () => {
    const impactModel = new CloudCarbonFootprint();
    await impactModel.configure('test', {
      vendor: 'aws',
      'instance-type': 'm5n.large',
    });
    await expect(
      impactModel.calculate([
        {
          duration: 3600,
          'cpu-util': 10,
          timestamp: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          'cpu-util': 50,
          timestamp: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          'cpu-util': 100,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).resolves.toStrictEqual([
      {
        duration: 3600,
        'cpu-util': 10,
        timestamp: '2021-01-01T00:00:00Z',
        energy: 0.0019435697915529846,
        'embodied-carbon': 91.94006849315068,
      },
      {
        duration: 3600,
        'cpu-util': 50,
        timestamp: '2021-01-01T00:00:00Z',
        energy: 0.0046062540925461085,
        'embodied-carbon': 91.94006849315068,
      },
      {
        duration: 3600,
        'cpu-util': 100,
        timestamp: '2021-01-01T00:00:00Z',
        energy: 0.007934609468787513,
        'embodied-carbon': 91.94006849315068,
      },
    ]);
  });
  test('initialize with params:azure', async () => {
    const impactModel = new CloudCarbonFootprint();
    await impactModel.configure('test', {
      vendor: 'azure',
      'instance-type': 'D2 v4',
    });
    await expect(
      impactModel.calculate([
        {
          duration: 3600,
          'cpu-util': 10,
          timestamp: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          'cpu-util': 50,
          timestamp: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          'cpu-util': 100,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).resolves.toStrictEqual([
      {
        duration: 3600,
        'cpu-util': 10,
        timestamp: '2021-01-01T00:00:00Z',
        energy: 0.0019435697915529846,
        'embodied-carbon': 0.08179908675799086 * 1000,
      },
      {
        duration: 3600,
        'cpu-util': 50,
        timestamp: '2021-01-01T00:00:00Z',
        energy: 0.0046062540925461085,
        'embodied-carbon': 0.08179908675799086 * 1000,
      },
      {
        duration: 3600,
        'cpu-util': 100,
        timestamp: '2021-01-01T00:00:00Z',
        energy: 0.007934609468787513,
        'embodied-carbon': 0.08179908675799086 * 1000,
      },
    ]);
  });
  test('initialize with params:gcp', async () => {
    const impactModel = new CloudCarbonFootprint();
    await impactModel.configure('test', {
      vendor: 'gcp',
      'instance-type': 'n2-standard-2',
    });
    await expect(
      impactModel.calculate([
        {
          duration: 3600,
          'cpu-util': 10,
          timestamp: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          'cpu-util': 50,
          timestamp: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          'cpu-util': 100,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).resolves.toStrictEqual([
      {
        duration: 3600,
        'cpu-util': 10,
        timestamp: '2021-01-01T00:00:00Z',
        energy: 0.0018785992503765141,
        'embodied-carbon': 0.10778881278538813 * 1000,
      },
      {
        duration: 3600,
        'cpu-util': 50,
        timestamp: '2021-01-01T00:00:00Z',
        energy: 0.004281401386663755,
        'embodied-carbon': 0.10778881278538813 * 1000,
      },
      {
        duration: 3600,
        'cpu-util': 100,
        timestamp: '2021-01-01T00:00:00Z',
        energy: 0.0072849040570228075,
        'embodied-carbon': 0.10778881278538813 * 1000,
      },
    ]);
  });

  test('initialize with wrong params', async () => {
    const impactModel = new CloudCarbonFootprint();
    await expect(
      impactModel.configure('test', {
        vendor: 'aws',
        'instance-type': 't5.micro',
      })
    ).rejects.toThrowError();
    await expect(
      impactModel.calculate([
        {duration: 3600, 'cpu-util': 50, timestamp: '2021-01-01T00:00:00Z'},
      ])
    ).rejects.toThrowError();
  });
  test('initialize with wrong params', async () => {
    const impactModel = new CloudCarbonFootprint();
    await expect(
      impactModel.configure('test', {
        vendor: 'aws2',
        'instance-type': 't2.micro',
      })
    ).rejects.toThrowError();
    await expect(
      impactModel.calculate([
        {duration: 3600, 'cpu-util': 50, timestamp: '2021-01-01T00:00:00Z'},
      ])
    ).rejects.toThrowError();
  });

  test('initialize with correct params but wrong observation', async () => {
    const impactModel = new CloudCarbonFootprint();
    await expect(
      impactModel.configure('test', {
        vendor: 'aws',
        'instance-type': 't2.micro',
      })
    ).resolves.toBeInstanceOf(CloudCarbonFootprint);
    await expect(
      impactModel.calculate([
        {duration: 3600, cpus: 1, timestamp: '2021-01-01T00:00:00Z'},
      ])
    ).rejects.toThrowError();
  });
});
