import {describe, expect, jest, test} from '@jest/globals';
import {SciOModel} from './index';
jest.setTimeout(30000);

describe('sci-o:configure test', () => {
  test('initialize and test', async () => {
    const model = await new SciOModel().configure('sci-o', {});
    expect(model).toBeInstanceOf(SciOModel);
    await expect(
      model.calculate([
        {
          te: 200,
          tir: 60 * 60 * 24 * 30,
          el: 60 * 60 * 24 * 365 * 4,
          rr: 1,
          tor: 1,
        },
        {
          te: 200,
          duration: 60 * 60 * 24 * 30 * 2,
          tir: 'duration',
          el: 60 * 60 * 24 * 365 * 4,
          rr: 1,
          tor: 1,
        },
      ])
    ).resolves.toStrictEqual([
      {
        te: 200,
        tir: 60 * 60 * 24 * 30,
        el: 60 * 60 * 24 * 365 * 4,
        rr: 1,
        tor: 1,
        embodied: 4.10958904109589,
      },
      {
        te: 200,
        duration: 60 * 60 * 24 * 30 * 2,
        tir: 'duration',
        el: 60 * 60 * 24 * 365 * 4,
        rr: 1,
        tor: 1,
        embodied: 4.10958904109589 * 2,
      },
    ]);
    await expect(
      model.calculate([
        {
          tee: 200,
          duration: 60 * 60 * 24 * 30 * 2,
          tir: 'duration',
          el: 60 * 60 * 24 * 365 * 4,
          rr: 1,
          tor: 1,
          embodied: 4.10958904109589 * 2,
        },
      ])
    ).rejects.toThrowError();
  });
});
