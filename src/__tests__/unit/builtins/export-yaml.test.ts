import {ExportYaml} from '../../../builtins/export-yaml';
import {ERRORS} from '../../../util/errors';
import {saveYamlFileAs} from '../../../util/yaml';

import {tree, context} from '../../../__mocks__/builtins/export-csv';

jest.mock('../../../util/yaml', () => ({
  saveYamlFileAs: jest.fn(),
}));

const {CliInputError} = ERRORS;

describe('builtins/export-yaml: ', () => {
  describe('ExportYaml: ', () => {
    const exportYaml = ExportYaml();

    describe('init ExportYaml: ', () => {
      it('initalizes object with properties.', async () => {
        expect(exportYaml).toHaveProperty('executeExhaust');
      });
    });

    describe('execute', () => {
      it('returns result with correct arguments', async () => {
        const outputPath = 'outputPath.yaml';

        await exportYaml.executeExhaust(tree, context, outputPath);

        expect(saveYamlFileAs).toHaveBeenCalledWith(
          {...context, tree},
          `${outputPath.split('#')[0]}.yaml`
        );
      });

      it('throws an error if outputPath is not provided.', async () => {
        expect.assertions(2);

        try {
          await exportYaml.executeExhaust({}, context, '');
        } catch (error) {
          expect(error).toBeInstanceOf(CliInputError);
          expect(error).toEqual(new CliInputError('Output path is required.'));
        }
      });
    });
  });
});
