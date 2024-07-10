import {jest} from '@jest/globals';
import * as fs from 'fs/promises';
import {stringify} from 'csv-stringify/sync';
import {ERRORS} from '@grnsft/if-core/utils';

import {executeCsv, getManifestData} from '../../../if-csv/util/helpers';
import {CsvOptions} from '../../../if-csv/types/csv';

const {ManifestValidationError} = ERRORS;

import {
  tree,
  context,
  outputs,
  aggregated,
  aggregation,
} from '../../../__mocks__/builtins/export-csv';

jest.mock('fs/promises', () => {
  const originalModule =
    jest.requireActual<typeof import('fs/promises')>('fs/promises');
  return {
    __esModule: true,
    ...originalModule,
    writeFile: jest.fn(() => Promise.resolve()),
  };
});

describe('if-csv/util/helpers: ', () => {
  describe('executeCsv(): ', () => {
    it('generates CSV file with correct data.', async () => {
      const outputPath = 'output';
      const columns = ['Path', 'Aggregated', '2023-12-12T00:00:00.000Z'];
      const matrix = [
        columns,
        ['tree.carbon', 8000.000004051243, 8000.000004051243],
        [
          'tree.children.child-1.carbon',
          4000.0000020256216,
          4000.0000020256216,
        ],
        [
          'tree.children.child-2.carbon',
          4000.0000020256216,
          4000.0000020256216,
        ],
      ];
      const reformedContext = Object.assign({}, context, {outputs});
      const reformedTree = Object.assign({}, tree, {
        children: {
          ...tree.children,
          'child-1': {
            ...tree.children['child-1'],
            aggregated,
          },
          'child-2': {
            ...tree.children['child-2'],
            aggregated,
          },
        },
      });

      const options: CsvOptions = {
        tree: reformedTree,
        context: reformedContext,
        outputPath,
        params: 'carbon',
      };

      await executeCsv(options);

      expect(fs.writeFile).toHaveBeenCalledWith(
        'output.csv',
        stringify(matrix, {columns})
      );
    });

    it('generates CSV file when the `outputs` type is missing.', async () => {
      const outputPath = 'output';
      const columns = ['Path', 'Aggregated', '2023-12-12T00:00:00.000Z'];
      const matrix = [
        columns,
        ['tree.carbon', 8000.000004051243, 8000.000004051243],
        [
          'tree.children.child-1.carbon',
          4000.0000020256216,
          4000.0000020256216,
        ],
        [
          'tree.children.child-2.carbon',
          4000.0000020256216,
          4000.0000020256216,
        ],
      ];

      const reformedTree = Object.assign({}, tree, {
        children: {
          ...tree.children,
          'child-1': {
            ...tree.children['child-1'],
            aggregated,
          },
          'child-2': {
            ...tree.children['child-2'],
            aggregated,
          },
        },
      });

      const options: CsvOptions = {
        tree: reformedTree,
        context,
        outputPath,
        params: 'carbon',
      };

      await executeCsv(options);

      expect.assertions(1);

      expect(fs.writeFile).toHaveBeenCalledWith(
        'output.csv',
        stringify(matrix, {columns})
      );
    });

    it('generates CSV file when `aggregation` persists.', async () => {
      const outputPath = 'output';
      const columns = ['Path', 'Aggregated', '2023-12-12T00:00:00.000Z'];
      const matrix = [
        columns,
        ['tree.carbon', 8000.000004051243, 8000.000004051243],
        [
          'tree.children.child-1.carbon',
          4000.0000020256216,
          4000.0000020256216,
        ],
        [
          'tree.children.child-2.carbon',
          4000.0000020256216,
          4000.0000020256216,
        ],
      ];

      const reformedContext = Object.assign(
        {},
        context,
        {outputs},
        {aggregation}
      );
      const reformedTree = Object.assign({}, tree, {
        children: {
          ...tree.children,
          'child-1': {
            ...tree.children['child-1'],
            aggregated,
          },
          'child-2': {
            ...tree.children['child-2'],
            aggregated,
          },
        },
      });

      const options: CsvOptions = {
        tree: reformedTree,
        context: reformedContext,
        outputPath,
        params: 'carbon',
      };

      await executeCsv(options);

      expect.assertions(1);
      expect(fs.writeFile).toHaveBeenCalledWith(
        'output.csv',
        stringify(matrix, {columns})
      );
    });

    it('returns string when `outputPath` is not provided', async () => {
      const columns = ['Path', 'Aggregated', '2023-12-12T00:00:00.000Z'];
      const matrix = [
        columns,
        ['tree.carbon', 8000.000004051243, 8000.000004051243],
        [
          'tree.children.child-1.carbon',
          4000.0000020256216,
          4000.0000020256216,
        ],
      ];

      const options: CsvOptions = {
        tree,
        context,
        outputPath: undefined,
        params: 'carbon',
      };

      const result = await executeCsv(options);

      expect.assertions(1);
      expect(result).toEqual(stringify(matrix, {columns}));
    });

    it('generates CSV file when `aggregation` is missing.', async () => {
      const outputPath = 'output';
      const columns = ['Path', 'Aggregated', '2023-12-12T00:00:00.000Z'];
      const matrix = [
        columns,
        ['tree.carbon', 8000.000004051243, 8000.000004051243],
        [
          'tree.children.child-1.carbon',
          4000.0000020256216,
          4000.0000020256216,
        ],
        [
          'tree.children.child-2.carbon',
          4000.0000020256216,
          4000.0000020256216,
        ],
      ];

      const reformedContext = Object.assign({}, context, {outputs});
      const options: CsvOptions = {
        tree,
        context: reformedContext,
        outputPath,
        params: 'carbon',
      };

      await executeCsv(options);

      expect.assertions(1);
      expect(fs.writeFile).toHaveBeenCalledWith(
        'output.csv',
        stringify(matrix, {columns})
      );
    });
  });

  describe('getManifestData(): ', () => {
    it('returns correct manifest data.', async () => {
      process.env.MOCK_MANIFEST = 'true';
      const mockManifestPath = './src/__mocks__/mock-manifest.yaml';
      const result = await getManifestData(mockManifestPath);

      expect.assertions(2);
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('tree');
    });

    it('throws an error when there is not `outputs` in the manifest.', async () => {
      process.env.MOCK_MANIFEST = 'false';
      const mockManifestPath = '';
      const load = require('../../../common/lib/load');
      const spyLoad = jest.spyOn(load, 'load');

      spyLoad.mockReturnValue({
        rawManifest: {tree: {children: {child: {}}}},
      });
      expect.assertions(1);
      try {
        await getManifestData(mockManifestPath);
      } catch (error) {
        expect(error).toEqual(
          new ManifestValidationError('Manifest outputs are not available!')
        );
      }
    });
  });
});
