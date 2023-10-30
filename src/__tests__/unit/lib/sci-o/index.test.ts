import {describe, expect, jest, test} from '@jest/globals';
import {SciOModel} from '../../../../lib/sci-o/index';
jest.setTimeout(30000);

describe('ccf:configure test', () => {
  test('initialize and test', async () => {
    const model = await new SciOModel().configure('ccf', {});
    expect(model).toBeInstanceOf(SciOModel);
    await expect(
      model.execute([
        {
          'grid-carbon-intensity': 200.0,
          energy: 100.0,
        },
      ])
    ).resolves.toStrictEqual([
      {
        'grid-carbon-intensity': 200.0,
        energy: 100.0,
        'operational-carbon': 100.0 * 200.0,
      },
    ]);
    await expect(
      model.execute([
        {
          'grid-carbon-intensity': 212.1,
          energy: 100.0,
        },
      ])
    ).resolves.toStrictEqual([
      {
        'grid-carbon-intensity': 212.1,
        energy: 100.0,
        'operational-carbon': 100.0 * 212.1,
      },
    ]);
    await expect(
      model.execute([
        {
          'grid-carbon-intensityd': 212.1,
          energy: 100.0,
        },
      ])
    ).rejects.toThrowError();
  });
});
