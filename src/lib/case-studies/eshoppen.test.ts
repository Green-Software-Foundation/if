import {describe, expect, jest, test} from '@jest/globals';
import {Eshoppen} from './eshoppen';
jest.setTimeout(30000);

describe('eshoppen:configure test', () => {
  test('initialize and test', async () => {
    const model = await new Eshoppen().configure('eshoppen', {});
    expect(model).toBeInstanceOf(Eshoppen);
    await expect(
      model.calculate([
        {
        },
      ])
    ).resolves.toStrictEqual([
      {
      },
    ]);
    await expect(
      model.calculate([
        {
          'grid-ci': 212.1,
          energy: 100.0,
        },
      ])
    ).resolves.toStrictEqual([
      {
        'grid-ci': 212.1,
        energy: 100.0,
        'operational-carbon': 100.0 * 212.1,
      },
    ]);
    await expect(
      model.calculate([
        {
          'grid-cid': 212.1,
          energy: 100.0,
        },
      ])
    ).rejects.toThrowError();
  });
});
