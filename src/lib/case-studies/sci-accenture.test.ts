import {describe, expect, jest, test} from '@jest/globals';
import {SciAccenture} from './sci-accenture';

jest.setTimeout(30000);

describe('eshoppen:configure test', () => {
  test('initialize and test', async () => {
    const model = await new SciAccenture().configure('sci-accenture', {});
    expect(model).toBeInstanceOf(SciAccenture);
    await expect(
      model.calculate([
        {
          'sci-total': 1,
        },
      ])
    ).resolves.toStrictEqual([
      {
        'sci-total': 1,
        sci: 1.05,
      },
    ]);
    await expect(model.calculate([{}])).rejects.toThrowError();
  });
});
