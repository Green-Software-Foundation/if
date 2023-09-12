import { describe, expect, jest, test } from '@jest/globals';
import { EMemModel } from './index';

jest.setTimeout(30000);

describe('teads:configure test', () => {
  test('initialize with params', async () => {
    const impactModel = new EMemModel();
    await impactModel.configure('test', {
      mem_alloc: 32,
      mem_energy: 0.38
    });
    await expect(
      impactModel.calculate([
        {
          duration: 3600,
          'mem-util': 50.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).resolves.toStrictEqual([
      {
        energy: 0.00608,
        duration: 3600,
        'mem-util': 50.0,
        timestamp: '2021-01-01T00:00:00Z',
      },
    ]);
  });
  test('initialize with params', async () => {
    const impactModel = new EMemModel();
    await impactModel.configure('test', {
      mem_alloc: 32,
      mem_energy: 0.38
    });
    await expect(
      impactModel.calculate([
        {
          duration: 3600,
          'mem-util': 10.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          'mem-util': 50.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          'mem-util': 90.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).resolves.toStrictEqual([
      {
        energy: 0.0012160000000000003,
        duration: 3600,
        'mem-util': 10.0,
        timestamp: '2021-01-01T00:00:00Z',
      },
      {
        energy: 0.00608,
        duration: 3600,
        'mem-util': 50.0,
        timestamp: '2021-01-01T00:00:00Z',
      },
      {
        energy: 0.010944,
        duration: 3600,
        'mem-util': 90.0,
        timestamp: '2021-01-01T00:00:00Z',
      },
    ]);
  })

});
