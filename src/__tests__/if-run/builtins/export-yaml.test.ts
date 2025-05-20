import {ERRORS} from '@grnsft/if-core/utils';

import {ExportYaml} from '../../../if-run/builtins/export-yaml';
import {saveYamlFileAs} from '../../../common/util/yaml';

import {STRINGS} from '../../../if-run/config';

import {tree, context} from '../../../__mocks__/builtins/export-yaml';

jest.mock('../../../common/util/yaml', () => ({
  saveYamlFileAs: jest.fn(),
}));

const {ExhaustOutputArgError} = ERRORS;
const {OUTPUT_REQUIRED} = STRINGS;

describe('builtins/export-yaml: ', () => {
  describe('ExportYaml: ', () => {
    const exportYaml = ExportYaml();

    describe('init ExportYaml: ', () => {
      it('initalizes object with properties.', async () => {
        expect(exportYaml).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('returns result with correct arguments.', async () => {
        const outputPath = 'outputPath.yaml';

        await exportYaml.execute(tree, context, outputPath);

        expect(saveYamlFileAs).toHaveBeenCalledWith(
          {...context, tree},
          outputPath
        );
      });

      it('returns result when path name is without extension.', async () => {
        const outputPath = 'outputPath';

        await exportYaml.execute(tree, context, outputPath);

        expect(saveYamlFileAs).toHaveBeenCalledWith(
          {...context, tree},
          'outputPath.yaml'
        );
      });

      it('throws an error if outputPath is not provided.', async () => {
        expect.assertions(2);

        try {
          await exportYaml.execute({}, context, '');
        } catch (error) {
          expect(error).toBeInstanceOf(ExhaustOutputArgError);
          expect(error).toEqual(new ExhaustOutputArgError(OUTPUT_REQUIRED));
        }
      });
    });
  });
});
