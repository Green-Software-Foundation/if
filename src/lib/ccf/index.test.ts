import {describe, expect, jest, test} from '@jest/globals';
import {CloudCarbonFootprint} from './index';

jest.setTimeout(30000);

describe('ccf:configure test', () => {
  test('initialize with params', async () => {
    const impactModel = new CloudCarbonFootprint();
    await impactModel.configure('test', {
      provider: 'aws',
      instance_type: 't2.micro',
    });
    await expect(
      impactModel.calculate([
        {duration: 3600, cpu: 0.5, datetime: '2021-01-01T00:00:00Z'},
      ])
    ).resolves.toStrictEqual([
      {
        energy: 0.0023031270462730543,
        embodied_emissions: 0.04216723744292237 * 1000,
      },
    ]);
  });
  test('initialize with params:aws', async () => {
    const impactModel = new CloudCarbonFootprint();
    await impactModel.configure('test', {
      provider: 'aws',
      instance_type: 'm5n.large',
    });
    await expect(
      impactModel.calculate([
        {
          duration: 3600,
          cpu: 0.1,
          datetime: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          cpu: 0.5,
          datetime: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          cpu: 1,
          datetime: '2021-01-01T00:00:00Z',
        },
      ])
    ).resolves.toStrictEqual([
      {
        energy: 0.0019435697915529846,
        embodied_emissions: 91.94006849315068,
      },
      {
        energy: 0.0046062540925461085,
        embodied_emissions: 91.94006849315068,
      },
      {
        energy: 0.007934609468787513,
        embodied_emissions: 91.94006849315068,
      },
    ]);
  });
  test('initialize with params:azure', async () => {
    const impactModel = new CloudCarbonFootprint();
    await impactModel.configure('test', {
      provider: 'azure',
      instance_type: 'D2 v4',
    });
    await expect(
      impactModel.calculate([
        {
          duration: 3600,
          cpu: 0.1,
          datetime: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          cpu: 0.5,
          datetime: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          cpu: 1,
          datetime: '2021-01-01T00:00:00Z',
        },
      ])
    ).resolves.toStrictEqual([
      {
        energy: 0.0019435697915529846,
        embodied_emissions: 0.08179908675799086 * 1000,
      },
      {
        energy: 0.0046062540925461085,
        embodied_emissions: 0.08179908675799086 * 1000,
      },
      {
        energy: 0.007934609468787513,
        embodied_emissions: 0.08179908675799086 * 1000,
      },
    ]);
  });
  test('initialize with params:gcp', async () => {
    const impactModel = new CloudCarbonFootprint();
    await impactModel.configure('test', {
      provider: 'gcp',
      instance_type: 'n2-standard-2',
    });
    await expect(
      impactModel.calculate([
        {
          duration: 3600,
          cpu: 0.1,
          datetime: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          cpu: 0.5,
          datetime: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          cpu: 1,
          datetime: '2021-01-01T00:00:00Z',
        },
      ])
    ).resolves.toStrictEqual([
      {
        energy: 0.0018785992503765141,
        embodied_emissions: 0.10778881278538813 * 1000,
      },
      {
        energy: 0.004281401386663755,
        embodied_emissions: 0.10778881278538813 * 1000,
      },
      {
        energy: 0.0072849040570228075,
        embodied_emissions: 0.10778881278538813 * 1000,
      },
    ]);
  });

  test('initialize with wrong params', async () => {
    const impactModel = new CloudCarbonFootprint();
    await expect(
      impactModel.configure('test', {
        provider: 'aws',
        instance_type: 't5.micro',
      })
    ).rejects.toThrowError();
    await expect(
      impactModel.calculate([
        {duration: 3600, cpu: 0.5, datetime: '2021-01-01T00:00:00Z'},
      ])
    ).rejects.toThrowError();
  });
  test('initialize with wrong params', async () => {
    const impactModel = new CloudCarbonFootprint();
    await expect(
      impactModel.configure('test', {
        provider: 'aws2',
        instance_type: 't2.micro',
      })
    ).rejects.toThrowError();
    await expect(
      impactModel.calculate([
        {duration: 3600, cpu: 0.5, datetime: '2021-01-01T00:00:00Z'},
      ])
    ).rejects.toThrowError();
  });

  test('initialize with correct params but wrong observation', async () => {
    const impactModel = new CloudCarbonFootprint();
    await expect(
      impactModel.configure('test', {
        provider: 'aws',
        instance_type: 't2.micro',
      })
    ).resolves.toBeInstanceOf(CloudCarbonFootprint);
    await expect(
      impactModel.calculate([
        {duration: 3600, cpus: 1, datetime: '2021-01-01T00:00:00Z'},
      ])
    ).rejects.toThrowError();
  });
});
