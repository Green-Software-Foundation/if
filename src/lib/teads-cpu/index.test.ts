import {describe, expect, jest, test} from '@jest/globals';
import {TeadsCPUModel} from './index';

jest.setTimeout(30000);

describe('teads:configure test', () => {
  test('initialize with params', async () => {
    const impactModel = new TeadsCPUModel();
    await impactModel.configure('test', {
      tdp: 200,
    });
    await expect(
      impactModel.calculate([
        {
          duration: 3600,
          cpu: 0.5,
          datetime: '2021-01-01T00:00:00Z'
        },
      ])
    ).resolves.toStrictEqual([
      {
        energy: 0.15,
        duration: 3600,
        cpu: 0.5,
        datetime: '2021-01-01T00:00:00Z',
      },
    ]);
  });
  test('teads:initialize with params', async () => {
    const impactModel = new TeadsCPUModel();
    await impactModel.configure('test', {
      tdp: 300,
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
        duration: 3600,
        cpu: 0.1,
        datetime: '2021-01-01T00:00:00Z',
        energy: 0.096,
      },
      {
        duration: 3600,
        cpu: 0.5,
        datetime: '2021-01-01T00:00:00Z',
        energy: 0.225,
      },
      {
        duration: 3600,
        cpu: 1,
        datetime: '2021-01-01T00:00:00Z',
        energy: 0.306,
      },
    ]);
  });
});
