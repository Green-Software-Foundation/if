/* eslint-disable @typescript-eslint/ban-ts-comment */
jest.mock('fs', () => require('../../../__mocks__/fs'));

import {exhaust} from '../../../lib/exhaust';

jest.mock('../../../builtins/export-yaml', () => ({
  ExportYaml: jest.fn().mockImplementation(() => ({
    // @ts-ignore
    execute: (tree, context, outputOptions) => {
      expect(outputOptions).toBe('mock-path');
    },
  })),
}));
describe('lib/exhaust: ', () => {
  describe('exhaust(): ', () => {
    const spy = jest.spyOn(global.console, 'log');

    beforeEach(() => {
      spy.mockReset();
    });

    it('successfully executes provided yaml file.', async () => {
      const tree = {};
      const context = {
        initialize: {},
      };
      const outputOptions = {outputPath: 'mock-path'};

      // @ts-ignore
      await exhaust(tree, context, outputOptions);

      expect.assertions(1);
    });

    it('returns void if no exhaust plugin selected.', async () => {
      const tree = {};
      const context = {
        initialize: {},
      };

      // @ts-ignore
      const result = await exhaust(tree, context, {});

      expect(result).toBeUndefined();
    });

    it('uses log exhaust plugin as export.', async () => {
      const tree = {};
      const context = {
        initialize: {},
      };

      // @ts-ignore
      await exhaust(tree, context, {'no-outout': false});
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
