import { describe, expect, jest, test } from '@jest/globals';
import { EAvevaModel } from '../../../../lib/case-studies/aveva-model';

jest.setTimeout(30000);

describe('aveva:configure test', () => {
  test('initialize with params', async () => {
    const impactModel = new EAvevaModel();
    expect(impactModel.name).toBeUndefined();
    await impactModel.configure('test', {});
    expect(impactModel.name).toBe('test');
    impactModel.authenticate({});
    expect(impactModel.authParams).toStrictEqual({});
    expect(impactModel.modelIdentifier()).toBe('aveva');
    await expect(impactModel.calculate([])).resolves.toStrictEqual([]);
    await expect(impactModel.calculate(undefined)).rejects.toThrowError();
    await expect(impactModel.calculate({})).rejects.toThrowError();
    await expect(
      impactModel.calculate([
        {
          pl: 16.009,
          pb: 11.335,
          time: 8322,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).resolves.toStrictEqual([
      {
        'energy-cpu': 38.897028,
        pl: 16.009,
        pb: 11.335,
        time: 8322,
        timestamp: '2021-01-01T00:00:00Z',
      },
    ]);
  });
});
