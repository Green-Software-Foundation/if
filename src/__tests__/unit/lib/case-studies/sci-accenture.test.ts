import { describe, expect, jest, test } from '@jest/globals';
import { SciAccentureModel } from '../../../../lib/case-studies/sci-accenture-model';

jest.setTimeout(30000);

describe('accenture:configure test', () => {
  test('initialize and test', async () => {
    const model = await new SciAccentureModel().configure('sci-accenture', {});
    expect(model).toBeInstanceOf(SciAccentureModel);
    await expect(
      model.execute([
        {
          sci: 1,
        },
      ])
    ).resolves.toStrictEqual([
      {
        sci: 1,
        sci_total: 1.05,
      },
    ]);
    await expect(model.execute([{}])).rejects.toThrowError();
  });
});
