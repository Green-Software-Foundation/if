import { describe, expect, jest, test } from '@jest/globals';
import { EAvevaModel } from './aveva-model';

jest.setTimeout(30000);

describe('emem:configure test', () => {
  test('initialize with params', async () => {
    const impactModel = new EAvevaModel();
    await impactModel.configure('test', {});
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
        'e-cpu': 38.897028,
        pl: 16.009,
        pb: 11.335,
        time: 8322,
        timestamp: '2021-01-01T00:00:00Z',
      },
    ]);
  });
});