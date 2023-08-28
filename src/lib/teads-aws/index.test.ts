import {describe, expect, jest, test} from '@jest/globals';
import {TEADSEngineeringAWS} from './index';

jest.setTimeout(30000);

describe('ccf:configure test', () => {
  test('initialize with params', async () => {
    const impactModel = new TEADSEngineeringAWS();
    await impactModel.configure('test', {
      instance_type: 't2.micro',
    });
    await expect(
      impactModel.calculate([
        {duration: 3600, cpu: 0.5, datetime: '2021-01-01T00:00:00Z'},
      ])
    ).resolves.toStrictEqual([
      {
        e: 0.0023031270462730543,
        m: 0.04216723744292237 * 1000,
      },
    ]);
  });
  test('initialize with params:aws', async () => {
    const impactModel = new TEADSEngineeringAWS();
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
        e: 0.0019435697915529846,
        m: 91.94006849315068,
      },
      {
        e: 0.0046062540925461085,
        m: 91.94006849315068,
      },
      {
        e: 0.007934609468787513,
        m: 91.94006849315068,
      },
    ]);
  });
});
