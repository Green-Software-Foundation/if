import {describe, expect, jest, test} from '@jest/globals';
import {
  EshoppenMemModel,
  EshoppenModel,
} from '../../../../lib/case-studies/eshoppen-model';

jest.setTimeout(30000);

describe('eshoppen:configure test', () => {
  test('initialize and test', async () => {
    const model = await new EshoppenModel().configure('eshoppen', {
      type: 'energy-cpu',
    });
    expect(model).toBeInstanceOf(EshoppenModel);
    await expect(
      model.execute([
        {
          'n-hours': 1,
          'n-chips': 1,
          'thermal-design-power': 120,
          'tdp-coeff': 1.02,
        },
      ])
    ).resolves.toStrictEqual([
      {
        'energy-cpu': 0.12240000000000001,
        'n-hours': 1,
        'n-chips': 1,
        'thermal-design-power': 120,
        'tdp-coeff': 1.02,
      },
    ]);
    await expect(model.execute([{}])).rejects.toThrowError();
    await expect(model.execute({})).rejects.toThrowError();
    expect(model.authenticate({test: 'test'})).toBe(undefined);

    const model2 = await new EshoppenMemModel().configure('eshoppen', {
      type: 'energy-memory',
    });
    expect(model2).toBeInstanceOf(EshoppenMemModel);
    await expect(
      model2.execute([
        {
          'n-hours': 1,
          'n-chips': 1,
          'tdp-mem': 1,
          'tdp-coeff': 1,
        },
      ])
    ).resolves.toStrictEqual([
      {
        'energy-memory': 0.001,
        'n-chips': 1,
        'n-hours': 1,
        'tdp-coeff': 1,
        'tdp-mem': 1,
      },
    ]);
  });
});
