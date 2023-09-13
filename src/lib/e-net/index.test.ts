import {describe, expect, jest, test} from '@jest/globals';
import {ENetModel} from './index';

jest.setTimeout(30000);

describe('teads:configure test', () => {
  test('initialize with params', async () => {
    const impactModel = new ENetModel();
    await impactModel.configure('test', {
      net_energy: 0.001,
    });
    await expect(
      impactModel.calculate([
        {
          duration: 3600,
          'data-in': 14.3,
          'data-out': 1.16,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).resolves.toStrictEqual([
      {
        e_net: 0.015460000000000002,
        duration: 3600,
        'data-in': 14.3,
        'data-out': 1.16,
        timestamp: '2021-01-01T00:00:00Z',
      },
    ]);
  });
  test('initialize with params', async () => {
    const impactModel = new ENetModel();
    await impactModel.configure('test', {
      net_energy: 0.001,
    });
    await expect(
      impactModel.calculate([
        {
          duration: 3600,
          'data-in': 14.3,
          'data-out': 1.16,
          timestamp: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          'data-in': 1.3,
          'data-out': 0.16,
          timestamp: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          'data-in': 145.3,
          'data-out': 100.16,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).resolves.toStrictEqual([
      {
        e_net: 0.015460000000000002,
        duration: 3600,
        'data-in': 14.3,
        'data-out': 1.16,
        timestamp: '2021-01-01T00:00:00Z',
      },
      {
        e_net: 0.00146,
        duration: 3600,
        'data-in': 1.3,
        'data-out': 0.16,
        timestamp: '2021-01-01T00:00:00Z',
      },
      {
        e_net: 0.24546,
        duration: 3600,
        'data-in': 145.3,
        'data-out': 100.16,
        timestamp: '2021-01-01T00:00:00Z',
      },
    ]);
  });
});
