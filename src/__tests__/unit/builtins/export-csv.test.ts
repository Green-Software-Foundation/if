import * as fs from 'fs/promises';

import {stringify} from 'csv-stringify/sync';
import {jest} from '@jest/globals';
import {ERRORS} from '@grnsft/if-core/utils';

import {ExportCSV} from '../../../builtins/export-csv';

import {STRINGS} from '../../../config';

import {
  tree,
  context,
  outputs,
  aggregated,
  aggregation,
} from '../../../__mocks__/builtins/export-csv';

const {ExhaustOutputArgError} = ERRORS;
const {OUTPUT_REQUIRED, CSV_EXPORT} = STRINGS;

jest.mock('fs/promises', () => ({
  writeFile: jest.fn<() => Promise<void>>().mockResolvedValue(),
}));

describe('builtins/export-csv: ', () => {
  describe('ExportCSV: ', () => {
    const exportCSV = ExportCSV();

    describe('init GroupBy: ', () => {
      it('initalizes object with properties.', async () => {
        expect(exportCSV).toMatchObject({metadata: {kind: 'exhaust'}});
        expect(exportCSV).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('generates CSV file with correct data.', async () => {
        const outputPath = 'output#carbon';
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

        await exportCSV.execute(reformedTree, reformedContext, outputPath);

        expect(fs.writeFile).toHaveBeenCalledWith(
          'output.csv',
          stringify(matrix, {columns})
        );
      });

      it('generates CSV file when the `outputs` type is missing.', async () => {
        const outputPath = 'output#carbon';
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

        await exportCSV.execute(reformedTree, context, outputPath);

        expect.assertions(1);

        expect(fs.writeFile).toHaveBeenCalledWith(
          'output.csv',
          stringify(matrix, {columns})
        );
      });

      it('generates CSV file when `aggregation` persists.', async () => {
        const outputPath = 'output#carbon';
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

        await exportCSV.execute(reformedTree, reformedContext, outputPath);

        expect.assertions(1);
        expect(fs.writeFile).toHaveBeenCalledWith(
          'output.csv',
          stringify(matrix, {columns})
        );
      });

      it('generates CSV file when `aggregation` is missing.', async () => {
        const outputPath = 'output#carbon';
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

        await exportCSV.execute(tree, reformedContext, outputPath);

        expect.assertions(1);
        expect(fs.writeFile).toHaveBeenCalledWith(
          'output.csv',
          stringify(matrix, {columns})
        );
      });

      it('throws an error when output path is empty.', async () => {
        const outputPath = '';

        context.initialize = Object.assign({}, context.initialize, outputs);

        try {
          await exportCSV.execute(tree, context, outputPath);
        } catch (error) {
          expect(error).toBeInstanceOf(ExhaustOutputArgError);
          expect(error).toEqual(new ExhaustOutputArgError(OUTPUT_REQUIRED));
        }
      });

      it('throws an error when output path does not contains `#`.', async () => {
        const outputPath = 'output.csv';

        context.initialize = Object.assign({}, context.initialize, outputs);

        try {
          await exportCSV.execute(tree, context, outputPath);
        } catch (error) {
          expect(error).toBeInstanceOf(ExhaustOutputArgError);
          expect(error).toEqual(new ExhaustOutputArgError(CSV_EXPORT));
        }
      });

      it('throws an error when output path does not contains a criteria.', async () => {
        const outputPath = 'output.csv#';

        context.initialize = Object.assign({}, context.initialize, outputs);

        try {
          await exportCSV.execute(tree, context, outputPath);
        } catch (error) {
          expect(error).toBeInstanceOf(ExhaustOutputArgError);
          expect(error).toEqual(new ExhaustOutputArgError(CSV_EXPORT));
        }
      });
    });
  });
});
