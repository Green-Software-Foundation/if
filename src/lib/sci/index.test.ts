import {describe, expect, jest, test} from '@jest/globals';
import {SciModel} from './index';
jest.setTimeout(30000);

describe('ccf:configure test', () => {
  test('initialize and test', async () => {
    const model = await new SciModel().configure('name', {
      time: 'minutes',
      factor: 1,
    });
    expect(model).toBeInstanceOf(SciModel);
    await expect(
      model.calculate([
        {
          'operational-emissions': 0.02,
          'embodied-carbon': 5,
        },
      ])
    ).resolves.toStrictEqual([
      {
        'operational-emissions': 0.02,
        'embodied-carbon': 5,
        sci: 301.2,
      },
    ]);
    await expect(
      model.calculate([
        {
          'operational-emissions': 20,
          'embodied-carbon': 0.005,
        },
      ])
    ).resolves.toStrictEqual([
      {
        'operational-emissions': 20,
        'embodied-carbon': 0.005,
        sci: 1200.3,
      },
    ]);
  }),
    test('initialize and test', async () => {
      const model = await new SciModel().configure('name', {
        time: 'days',
        factor: 100,
      });
      expect(model).toBeInstanceOf(SciModel);
      await expect(
        model.calculate([
          {
            'operational-emissions': 0.02,
            'embodied-carbon': 5,
          },
        ])
      ).resolves.toStrictEqual([
        {
          'operational-emissions': 0.02,
          'embodied-carbon': 5,
          sci: 4337.28,
        },
      ]);
      await expect(
        model.calculate([
          {
            'operational-emissions': 20,
            'embodied-carbon': 0.005,
          },
        ])
      ).resolves.toStrictEqual([
        {
          'operational-emissions': 20,
          'embodied-carbon': 0.005,
          sci: 17284.32,
        },
      ]);
    });
});
