import {describe, expect, jest, test} from '@jest/globals';
import {SciEModel} from '../../../../lib/sci-e/index';

jest.setTimeout(30000);

describe('sci-e:configure test', () => {
  test('initialize with params', async () => {
    const outputModel = new SciEModel();
    await outputModel.configure('test', {});
    await expect(
      outputModel.execute([
        {
          duration: 3600,
          'energy-cpu': 1,
          'energy-network': 1,
          'energy-memory': 1,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).resolves.toStrictEqual([
      {
        duration: 3600,
        'energy-cpu': 1,
        'energy-network': 1,
        'energy-memory': 1,
        energy: 3,
        timestamp: '2021-01-01T00:00:00Z',
      },
    ]);
  });
});
