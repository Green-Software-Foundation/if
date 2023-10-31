import {describe, expect, jest, test} from '@jest/globals';
import {ShellModel} from '../../../../lib/shell-imp/index';

jest.setTimeout(30000);

describe('lib/shell-imp: ', () => {
  describe('shell:configure', () => {
    test('initialize with params', async () => {
      const impactModel = new ShellModel();
      await impactModel.configure('test', {
        executable: '/usr/local/bin/sampler',
      });
      await expect(
        impactModel.calculate([
          {duration: 3600, cpu: 0.5, datetime: '2021-01-01T00:00:00Z'},
        ])
      ).resolves.toStrictEqual([
        {duration: 3600, cpu: 0.5, datetime: '2021-01-01T00:00:00Z', energy: 1},
      ]);
    });
  });
});
