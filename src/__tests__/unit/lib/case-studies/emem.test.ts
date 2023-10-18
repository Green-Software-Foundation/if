import {describe, expect, jest, test} from '@jest/globals';
import {EMemModel} from '../../../../lib/case-studies/emem-model';

jest.setTimeout(30000);

describe('emem:configure test', () => {
  test('initialize with params', async () => {
    const impactModel = new EMemModel();
    await expect(
      impactModel.calculate([
        {
          duration: 3600,
          'mem-util': 50.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).rejects.toThrowError();
    await impactModel.configure('test', {
      'mem-alloc': 32,
    });
    await expect(
      impactModel.calculate([
        {
          duration: 3600,
          'mem-util': 50.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).rejects.toThrowError();
    await impactModel.configure('test', {
      'mem-alloc': 32,
      'mem-energy': 0.38,
    });
    await expect(
      impactModel.calculate([
        {
          duration: 3600,
          'mem-util': 150.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).rejects.toThrowError();
    impactModel.authenticate({});
    await expect(impactModel.authParams).toStrictEqual({});
    await impactModel.configure('test', {
      'mem-alloc': 32,
      'mem-energy': 0.38,
    });
    await expect(impactModel.name).toBe('test');
    await expect(impactModel.configure('test')).rejects.toThrow();
    await expect(impactModel.calculate(undefined)).rejects.toThrow();
    await expect(impactModel.calculate({})).rejects.toThrow();
    expect(impactModel.modelIdentifier()).toBe('e-mem');
    await expect(
      impactModel.calculate([{timestamp: 'test'}])
    ).rejects.toThrow();
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
        'e-mem': 0.00608,
        duration: 3600,
        'mem-util': 50.0,
        timestamp: '2021-01-01T00:00:00Z',
      },
    ]);
  });
  test('initialize with params', async () => {
    const impactModel = new EMemModel();
    await impactModel.configure('test', {
      'mem-alloc': 32,
      'mem-energy': 0.38,
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
        'e-mem': 0.0012160000000000003,
        duration: 3600,
        'mem-util': 10.0,
        timestamp: '2021-01-01T00:00:00Z',
      },
      {
        'e-mem': 0.00608,
        duration: 3600,
        'mem-util': 50.0,
        timestamp: '2021-01-01T00:00:00Z',
      },
      {
        'e-mem': 0.010944,
        duration: 3600,
        'mem-util': 90.0,
        timestamp: '2021-01-01T00:00:00Z',
      },
    ]);
  });
});
