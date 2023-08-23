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
        e: 0.0023031270462730543,
        m: 0.04216723744292237,
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
        e: 0.0019435697915529846,
        m: 0.09194006849315069,
      },
      {
        e: 0.0046062540925461085,
        m: 0.09194006849315069,
      },
      {
        e: 0.007934609468787513,
        m: 0.09194006849315069,
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
        e: 0.0019435697915529846,
        m: 0.08179908675799086,
      },
      {
        e: 0.0046062540925461085,
        m: 0.08179908675799086,
      },
      {
        e: 0.007934609468787513,
        m: 0.08179908675799086,
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
        e: 0.0018785992503765141,
        m: 0.10778881278538813,
      },
      {
        e: 0.004281401386663755,
        m: 0.10778881278538813,
      },
      {
        e: 0.0072849040570228075,
        m: 0.10778881278538813,
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
