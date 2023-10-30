import {describe, expect, jest, test} from '@jest/globals';
import {EAvevaModel} from '../../../../lib/case-studies/aveva-model';

jest.setTimeout(30000);

describe('aveva:configure test', () => {
  test('initialize with params', async () => {
    const outputModel = new EAvevaModel();
    expect(outputModel.name).toBeUndefined();
    await outputModel.configure('test', {});
    expect(outputModel.name).toBe('test');
    outputModel.authenticate({});
    expect(outputModel.authParams).toStrictEqual({});
    expect(outputModel.modelIdentifier()).toBe('aveva');
    await expect(outputModel.execute([])).resolves.toStrictEqual([]);
    await expect(outputModel.execute(undefined)).rejects.toThrowError();
    await expect(outputModel.execute({})).rejects.toThrowError();
    await expect(
      outputModel.execute([
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
