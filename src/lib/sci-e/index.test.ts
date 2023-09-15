import {describe, expect, jest, test} from '@jest/globals';
import {SciEModel} from './index';

jest.setTimeout(30000);

describe('sci-e:configure test', () => {
  test('initialize with params', async () => {
    const impactModel = new SciEModel();
    await impactModel.configure('test', {});
    await expect(
      impactModel.calculate([
        {
          duration: 3600,
          'e-cpu': 1,
          'e-net': 1,
          'e-mem': 1,
          timestamp: '2021-01-01T00:00:00Z',
        },
      ])
    ).resolves.toStrictEqual([
      {
        duration: 3600,
        'e-cpu': 1,
        'e-net': 1,
        'e-mem': 1,
        energy: 3,
        timestamp: '2021-01-01T00:00:00Z',
      },
    ]);
  });
});
