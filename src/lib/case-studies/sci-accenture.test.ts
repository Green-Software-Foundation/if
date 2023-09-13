import {describe, expect, jest, test} from '@jest/globals';
import {SciAccentureModel} from './sci-accenture-model';

jest.setTimeout(30000);

describe('accenture:configure test', () => {
  test('initialize and test', async () => {
    const model = await new SciAccentureModel().configure('sci-accenture', {});
    expect(model).toBeInstanceOf(SciAccentureModel);
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
