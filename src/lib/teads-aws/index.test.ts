import {describe, expect, jest, test} from '@jest/globals';
import {TeadsAWS} from './index';

import {Interpolation} from '../../types/common';

jest.setTimeout(30000);

describe('teads:configure test', () => {
  test('initialize with params', async () => {
    const impactModel = new TeadsAWS();
    await impactModel.configure('test', {
      interpolation: Interpolation.LINEAR,
      'instance-type': 't2.micro',
    });
    await expect(
      impactModel.calculate([
        {
          duration: 3600,
          'cpu-util': 50,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).resolves.toStrictEqual([
      {
        duration: 3600,
        'cpu-util': 50,
        timestamp: '2021-01-01T00:00:00Z',
        energy: 0.004900000000000001,
        'embodied-carbon': 0.04216723744292237 * 1000,
      },
    ]);
  });
  test('teads:initialize with params: spline', async () => {
    const impactModel = new TeadsAWS();
    await impactModel.configure('test', {
      'instance-type': 'm5n.large',
      interpolation: Interpolation.SPLINE,
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
        energy: 0.0067,
        'embodied-carbon': 91.94006849315068,
      },
      {
        duration: 3600,
        'cpu-util': 50,
        timestamp: '2021-01-01T00:00:00Z',
        energy: 0.011800000000000001,
        'embodied-carbon': 91.94006849315068,
      },
      {
        duration: 3600,
        'cpu-util': 100,
        timestamp: '2021-01-01T00:00:00Z',
        energy: 0.016300000000000002,
        'embodied-carbon': 91.94006849315068,
      },
    ]);
  });
  test('teads:initialize with params: linear', async () => {
    const impactModel = new TeadsAWS();
    await impactModel.configure('test', {
      'instance-type': 'm5n.large',
      interpolation: Interpolation.LINEAR,
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
        energy: 0.0067,
        'embodied-carbon': 91.94006849315068,
      },
      {
        duration: 3600,
        'cpu-util': 50,
        timestamp: '2021-01-01T00:00:00Z',
        energy: 0.011800000000000001,
        'embodied-carbon': 91.94006849315068,
      },
      {
        duration: 3600,
        'cpu-util': 100,
        timestamp: '2021-01-01T00:00:00Z',
        energy: 0.016300000000000002,
        'embodied-carbon': 91.94006849315068,
      },
    ]);
  });
  test('teads:initialize with params: linear 2', async () => {
    const impactModel = new TeadsAWS();
    await impactModel.configure('test', {
      'instance-type': 'm5n.large',
      interpolation: Interpolation.LINEAR,
      'expected-lifespan': 8 * 365 * 24 * 3600,
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
        energy: 0.0067,
        'embodied-carbon': 45.97003424657534,
      },
      {
        duration: 3600,
        'cpu-util': 50,
        timestamp: '2021-01-01T00:00:00Z',
        energy: 0.011800000000000001,
        'embodied-carbon': 45.97003424657534,
      },
      {
        duration: 3600,
        'cpu-util': 100,
        timestamp: '2021-01-01T00:00:00Z',
        energy: 0.016300000000000002,
        'embodied-carbon': 45.97003424657534,
      },
    ]);
  });
});
