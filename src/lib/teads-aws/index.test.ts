import {describe, expect, jest, test} from '@jest/globals';
import {TeadsAWS} from './index';
import {Interpolation} from './index';

jest.setTimeout(30000);

describe('teads:configure test', () => {
  test('initialize with params', async () => {
    const impactModel = new TeadsAWS();
    await impactModel.configure('test', {
      instance_type: 't2.micro',
    });
    await expect(
      impactModel.calculate([
        {duration: 3600, cpu: 0.5, datetime: '2021-01-01T00:00:00Z'},
      ])
    ).resolves.toStrictEqual([
      {
        energy: 0.004900000000000001,
        embodied: 0.04216723744292237 * 1000,
      },
    ]);
  });
  test('teads:initialize with params: spline', async () => {
    const impactModel = new TeadsAWS();
    await impactModel.configure('test', {
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
        energy: 0.0067,
        embodied: 91.94006849315068,
      },
      {
        energy: 0.011800000000000001,
        embodied: 91.94006849315068,
      },
      {
        energy: 0.016300000000000002,
        embodied: 91.94006849315068,
      },
    ]);
  });
  test('teads:initialize with params: linear', async () => {
    const impactModel = new TeadsAWS();
    await impactModel.configure('test', {
      instance_type: 'm5n.large',
      interpolation: Interpolation.LINEAR,
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
        energy: 0.0067,
        embodied: 91.94006849315068,
      },
      {
        energy: 0.011800000000000001,
        embodied: 91.94006849315068,
      },
      {
        energy: 0.016300000000000002,
        embodied: 91.94006849315068,
      },
    ]);
  });
});
