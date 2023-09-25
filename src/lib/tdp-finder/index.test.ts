import {describe, expect, jest, test} from '@jest/globals';
import {TdpFinderModel} from './index';

jest.setTimeout(30000);

describe('tdp-finder:configure test', () => {
  test('initialize and test', async () => {
    const model = await new TdpFinderModel().configure('tdp', {});
    expect(model).toBeInstanceOf(TdpFinderModel);
    await expect(
      model.calculate([
        {
          'physical-processor': 'AMD 3020e',
        },
      ])
    ).resolves.toStrictEqual([
      {
        'physical-processor': 'AMD 3020e',
        tdp: 6.0,
      },
    ]);
    await expect(
      model.calculate([
        {
          'physical-processor': 'AMD 3020ef',
        },
      ])
    ).rejects.toThrowError();
  });
});
