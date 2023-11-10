import {describe, expect, jest, test} from '@jest/globals';
import {TdpFinderModel} from '../../../../lib';

jest.setTimeout(30000);

describe('tdp-finder:configure test', () => {
  test('initialize and test', async () => {
    const model = await new TdpFinderModel().configure('tdp', {});
    expect(model).toBeInstanceOf(TdpFinderModel);
    await expect(
      model.execute([
        {
          'physical-processor': 'AMD 3020e',
        },
      ])
    ).resolves.toStrictEqual([
      {
        'physical-processor': 'AMD 3020e',
        'thermal-design-power': 6.0,
      },
    ]);
    await expect(
      model.execute([
        {
          'physical-processor': 'Intel Xeon E5-2676 v3',
        },
      ])
    ).resolves.toStrictEqual([
      {
        'physical-processor': 'Intel Xeon E5-2676 v3',
        'thermal-design-power': 120.0,
      },
    ]);
    await expect(
      model.execute([
        {
          'physical-processor': 'Intel Xeon Platinum 8175M',
        },
      ])
    ).resolves.toStrictEqual([
      {
        'physical-processor': 'Intel Xeon Platinum 8175M',
        'thermal-design-power': 240.0,
      },
    ]);
    await expect(
      model.execute([
        {
          'physical-processor': 'AMD 3020ef',
        },
      ])
    ).rejects.toThrowError();
  });
});
