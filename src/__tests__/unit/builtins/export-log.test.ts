import * as YAML from 'js-yaml';

import {ExportLog} from '../../../builtins/export-log';
import {tree, context} from '../../../__mocks__/builtins/export-csv';

describe('builtins/export-log:', () => {
  describe('ExportLog: ', () => {
    it('successfully logs output manifest in console.', async () => {
      const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
      await ExportLog().execute(tree, context);

      const expectedMessage = `# start
${YAML.dump({...context, tree}, {noRefs: true})}
# end`;

      expect(mockConsoleLog).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(expectedMessage);

      mockConsoleLog.mockRestore();
    });

    it('successfully logs output manifest if tree is an empty object.', async () => {
      const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
      await ExportLog().execute({}, context);

      const expectedMessage = `# start
${YAML.dump({...context, tree: {}}, {noRefs: true})}
# end`;

      expect(mockConsoleLog).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(expectedMessage);

      mockConsoleLog.mockRestore();
    });
  });
});
