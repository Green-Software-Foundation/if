import {ExportLog} from '../../../builtins/export-log';

import {tree, context} from '../../../__mocks__/builtins/export-csv';

describe('builtins/export-log:', () => {
  describe('ExportLog: ', () => {
    it('successfully logs output manifest in console.', async () => {
      const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
      await ExportLog().executeExhaust(tree, context);

      expect(mockConsoleLog).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        JSON.stringify({...context, tree}, null, 2)
      );

      mockConsoleLog.mockRestore();
    });

    it('successfully logs output manifest if tree is an empty object.', async () => {
      const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
      await ExportLog().executeExhaust({}, context);

      expect(mockConsoleLog).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        JSON.stringify({...context, tree: {}}, null, 2)
      );

      mockConsoleLog.mockRestore();
    });
  });
});
