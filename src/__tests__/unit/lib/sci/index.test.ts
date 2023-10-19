import {describe, expect, jest, test} from '@jest/globals';
import {SciModel} from '../../../../lib/sci/index';
jest.setTimeout(30000);

describe('sci:configure test', () => {
  test('initialize and test', async () => {
    const model = await new SciModel().configure('name', {
      'functional-unit-time': 'minutes',
      'functional-unit': 'users',
      'functional-unit-duration': 1,
    });
    expect(model).toBeInstanceOf(SciModel);
    await expect(
      model.calculate([
        {
          'operational-carbon': 0.02,
          'embodied-carbon': 5,
          users: 100,
        },
      ])
    ).resolves.toStrictEqual([
      {
        'operational-carbon': 0.02,
        'embodied-carbon': 5,
        users: 100,
        sci: 3.012,
      },
    ]);
    await expect(
      model.calculate([
        {
          'operational-carbon': 20,
          'embodied-carbon': 0.005,
          users: 1000,
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
  });
  test('initialize and test', async () => {
    const model = await new SciModel().configure('name', {
      'functional-unit-time': 'days',
      'functional-unit': '',
      'functional-unit-duration': 3600,
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
        sci: 120.47999999999999,
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
        sci: 480.12,
      },
    ]);
  });
});
