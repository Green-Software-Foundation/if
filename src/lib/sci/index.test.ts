import { describe, expect, jest, test } from '@jest/globals';
import { SciModel } from './index';
jest.setTimeout(30000);

describe('sci:configure test', () => {
  test('initialize and test', async () => {
    const model = await new SciModel().configure('name', {
      time: 'minutes',
      functional_unit: 'users',
    });
    expect(model).toBeInstanceOf(SciModel);
    await expect(
      model.calculate([
        {
          'operational-carbon': 0.02,
          'embodied-carbon': 5,
          'users': 100
        },
      ])
    ).resolves.toStrictEqual([
      {
        'operational-carbon': 0.02,
        'embodied-carbon': 5,
        'users': 100,
        sci: 3.012,
      },
    ]);
    await expect(
      model.calculate([
        {
          'operational-carbon': 20,
          'embodied-carbon': 0.005,
          users: 1000
        },
      ])
    ).resolves.toStrictEqual([
      {
        'operational-carbon': 20,
        'embodied-carbon': 0.005,
        users: 1000,
        sci: 1.2003,
      },
    ]);
  }),
    test('initialize and test', async () => {
      const model = await new SciModel().configure('name', {
        time: 'days',
        functionalUnit: ''
      });
      expect(model).toBeInstanceOf(SciModel);
      await expect(
        model.calculate([
          {
            'operational-carbon': 0.02,
            'embodied-carbon': 5,
          },
        ])
      ).resolves.toStrictEqual([
        {
          'operational-carbon': 0.02,
          'embodied-carbon': 5,
          sci: 433728,
        },
      ]);
      await expect(
        model.calculate([
          {
            'operational-carbon': 20,
            'embodied-carbon': 0.005,
          },
        ])
      ).resolves.toStrictEqual([
        {
          'operational-carbon': 20,
          'embodied-carbon': 0.005,
          sci: 1728432,
        },
      ]);
    });
});
