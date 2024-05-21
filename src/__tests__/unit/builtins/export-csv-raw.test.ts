import * as fs from 'fs/promises';
import {jest} from '@jest/globals';

import {ExportCSVRaw} from '../../../builtins/export-csv-raw';
import {ERRORS} from '../../../util/errors';

import {tree, context, outputs} from '../../../__mocks__/builtins/export-csv';

const {ExhaustError} = ERRORS;

jest.mock('fs/promises', () => ({
  __esModule: true,
  writeFile: jest.fn<() => Promise<void>>().mockResolvedValue(),
}));

describe('builtins/export-csv-raw: ', () => {
  describe('ExportCSVRaw: ', () => {
    const exportCSVRaw = ExportCSVRaw();

    beforeEach(() => {
      jest.resetAllMocks();
    });

    describe('init GroupBy: ', () => {
      it('initalizes object with properties.', async () => {
        expect(exportCSVRaw).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('generates CSV file with correct data.', async () => {
        const outputPath = 'output#carbon';
        const content =
          "id,timestamp,cloud/instance-type,region,duration,cpu/utilization,network/energy,energy,cpu/thermal-design-power,grid/carbon-intensity,device/emissions-embodied,time-reserved,device/expected-lifespan,resources-reserved,resources-total,functional-unit-time,cpu/energy,carbon-plus-energy',carbon-embodied,carbon-operational,carbon,sci\nchildren.child-1.outputs.0,2023-12-12T00:00:00.000Z,A1,uk-west,1,10,10,5,100,800,1533.12,3600,94608000,1,8,1 min,0.000008888888888888888,10.000008888888889,0.0000020256215119228817,4000,4000.0000020256216,240000.0001215373\nchildren.child-2.outputs.0,2023-12-12T00:00:00.000Z,A1,uk-west,1,30,10,5,100,800,1533.12,3600,94608000,1,8,1 min,0.00001650338753387534,10.000016503387533,0.0000020256215119228817,4000,4000.0000020256216,240000.0001215373\noutputs.0,2023-12-12T00:00:00.000Z,,,1,,,,,,,,,,,,,,,,8000.000004051243,";

        await exportCSVRaw.execute(tree, context, outputPath);

        expect(fs.writeFile).toHaveBeenCalledWith(`${outputPath}.csv`, content);
      });

      it('throws an error when the CSV file could not be created.', async () => {
        const outputPath = 'output#carbon';

        expect.assertions(1);

        jest
          .spyOn(fs, 'writeFile')
          .mockRejectedValue('Could not write CSV file.');

        await expect(
          exportCSVRaw.execute(tree, context, outputPath)
        ).rejects.toThrow(
          new ExhaustError(
            'Failed to write CSV to output#carbon: Could not write CSV file.'
          )
        );
      });

      it('throws an error when output path is empty.', async () => {
        const outputPath = '';

        context.initialize = Object.assign({}, context.initialize, outputs);

        expect.assertions(2);
        try {
          await exportCSVRaw.execute(tree, context, outputPath);
        } catch (error) {
          expect(error).toBeInstanceOf(ExhaustError);
          expect(error).toEqual(new ExhaustError('Output path is required.'));
        }
      });
    });
  });
});
