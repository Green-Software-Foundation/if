import { describe, expect, jest, test } from '@jest/globals';
import { TeadsCurveModel } from '../../../../lib/teads-curve/index';

jest.setTimeout(30000);

describe('teads:configure test', () => {
  test('initialize with params', async () => {
    const impactModel = new TeadsCurveModel();
    await impactModel.configure('test', {
      tdp: 200,
    });
    await expect(
      impactModel.calculate([
        {
          duration: 3600,
          'cpu-util': 50.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).resolves.toStrictEqual([
      {
        'energy-cpu': 0.15,
        duration: 3600,
        'cpu-util': 50.0,
        timestamp: '2021-01-01T00:00:00Z',
      },
    ]);
  });
  test('teads:initialize with params:spline', async () => {
    const impactModel = new TeadsCurveModel();
    await impactModel.configure('test', {
      tdp: 300,
    });
    await expect(
      impactModel.calculate([
        {
          duration: 3600,
          'cpu-util': 10.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          'cpu-util': 50.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          'cpu-util': 100.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).resolves.toStrictEqual([
      {
        duration: 3600,
        'cpu-util': 10.0,
        timestamp: '2021-01-01T00:00:00Z',
        'energy-cpu': 0.096,
      },
      {
        duration: 3600,
        'cpu-util': 50.0,
        timestamp: '2021-01-01T00:00:00Z',
        'energy-cpu': 0.225,
      },
      {
        duration: 3600,
        'cpu-util': 100.0,
        timestamp: '2021-01-01T00:00:00Z',
        'energy-cpu': 0.306,
      },
    ]);
  });
  test('teads:initialize with params:linear', async () => {
    const impactModel = new TeadsCurveModel();
    await impactModel.configure('test', {
      tdp: 300,
      interpolation: 'linear',
    });
    await expect(
      impactModel.calculate([
        {
          duration: 3600,
          'cpu-util': 10.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          'cpu-util': 50.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          'cpu-util': 100.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          'cpu-util': 15.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          'cpu-util': 55.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
        {
          duration: 3600,
          'cpu-util': 75.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).resolves.toStrictEqual([
      {
        duration: 3600,
        'cpu-util': 10.0,
        timestamp: '2021-01-01T00:00:00Z',
        'energy-cpu': 0.096,
      },
      {
        duration: 3600,
        'cpu-util': 50.0,
        timestamp: '2021-01-01T00:00:00Z',
        'energy-cpu': 0.225,
      },
      {
        duration: 3600,
        'cpu-util': 100.0,
        timestamp: '2021-01-01T00:00:00Z',
        'energy-cpu': 0.306,
      },

      {
        duration: 3600,
        'cpu-util': 15.0,
        timestamp: '2021-01-01T00:00:00Z',
        'energy-cpu': 0.11212500000000002,
      },
      {
        duration: 3600,
        'cpu-util': 55.0,
        timestamp: '2021-01-01T00:00:00Z',
        'energy-cpu': 0.2331,
      },
      {
        duration: 3600,
        'cpu-util': 75.0,
        timestamp: '2021-01-01T00:00:00Z',
        'energy-cpu': 0.2655,
      },
    ]);
  });
});
