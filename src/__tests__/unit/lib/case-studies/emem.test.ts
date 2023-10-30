import {describe, expect, jest, test} from '@jest/globals';
import {EMemModel} from '../../../../lib/case-studies/emem-model';

jest.setTimeout(30000);

describe('emem:configure test', () => {
  test('initialize with params', async () => {
    const outputModel = new EMemModel();
    await expect(
      outputModel.execute([
        {
          duration: 3600,
          'mem-util': 50.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).rejects.toThrowError();
    await outputModel.configure('test', {
      'mem-alloc': 32,
    });
    await expect(
      outputModel.execute([
        {
          duration: 3600,
          'mem-util': 50.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).rejects.toThrowError();
    await outputModel.configure('test', {
      'mem-alloc': 32,
      'mem-energy': 0.38,
    });
    await expect(
      outputModel.execute([
        {
          duration: 3600,
          'mem-util': 150.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).rejects.toThrowError();
    outputModel.authenticate({});
    await expect(outputModel.authParams).toStrictEqual({});
    await outputModel.configure('test', {
      'mem-alloc': 32,
      'mem-energy': 0.38,
    });
    await expect(outputModel.name).toBe('test');
    await expect(outputModel.configure('test')).rejects.toThrow();
    await expect(outputModel.execute(undefined)).rejects.toThrow();
    await expect(outputModel.execute({})).rejects.toThrow();
    expect(outputModel.modelIdentifier()).toBe('energy-memory');
    await expect(outputModel.execute([{timestamp: 'test'}])).rejects.toThrow();
    await expect(
      outputModel.execute([
        {
          duration: 3600,
          'mem-util': 50.0,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).resolves.toStrictEqual([
      {
        'energy-memory': 0.00608,
        duration: 3600,
        'mem-util': 50.0,
        timestamp: '2021-01-01T00:00:00Z',
      },
    ]);
  });
  test('initialize with params', async () => {
    const outputModel = new EMemModel();
    await outputModel.configure('test', {
      'mem-alloc': 32,
      'mem-energy': 0.38,
    });
    await expect(
      outputModel.execute([
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
        'energy-memory': 0.0012160000000000003,
        duration: 3600,
        'mem-util': 10.0,
        timestamp: '2021-01-01T00:00:00Z',
      },
      {
        'energy-memory': 0.00608,
        duration: 3600,
        'mem-util': 50.0,
        timestamp: '2021-01-01T00:00:00Z',
      },
      {
        'energy-memory': 0.010944,
        duration: 3600,
        'mem-util': 90.0,
        timestamp: '2021-01-01T00:00:00Z',
      },
    ]);
  });
});
