import {describe, expect, jest, test} from '@jest/globals';
import {EshoppenModel} from './eshoppen-model';

jest.setTimeout(30000);

describe('eshoppen:configure test', () => {
  test('initialize and test', async () => {
    const model = await new EshoppenModel().configure('eshoppen', {
      type: 'e-cpu',
    });
    expect(model).toBeInstanceOf(EshoppenModel);
    await expect(
      model.calculate([
        {
          'n-hours': 1,
          'n-chips': 1,
          tdp: 120,
          'tdp-coeff': 1.02,
        },
      ])
    ).resolves.toStrictEqual([
      {
        'e-cpu': 0.12240000000000001,
        'n-hours': 1,
        'n-chips': 1,
        tdp: 120,
        'tdp-coeff': 1.02,
      },
    ]);
    await expect(model.calculate([{}])).rejects.toThrowError();
  });
});
