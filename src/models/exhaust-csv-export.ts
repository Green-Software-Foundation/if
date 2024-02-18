import * as path from 'path';
import * as fs from 'fs/promises';
import {ERRORS} from '../util/errors';
import {ExhaustPluginInterface} from './exhaust-plugin';
const {InputValidationError} = ERRORS;

export class ExhaustCsvExporter implements ExhaustPluginInterface {
  private createCsvContent(tree: any, headers: string[]): string {
    return [
      headers.join(','),
      ...tree.map((row: {[x: string]: any}) =>
        headers.map(fieldName => row[fieldName]).join(',')
      ),
    ].join('\r\n');
  }

  /**
   * Export to CSV
   */
  async execute(
    context: any,
    tree: any,
    basePath: string
  ): Promise<[any, any, string]> {
    // create directory in base path, if doesnt exist
    try {
      await fs.mkdir(basePath, {recursive: true});
    } catch (error) {
      // TODO PB -- suitable error (originally MakeDirectoryError)
      throw new InputValidationError(
        `Failed to write CSV to ${basePath} ${error}`
      );
    }

    // determine headers
    const headers = Object.keys(tree[0]);

    // create csv content from tree with headers
    const contents = this.createCsvContent(tree, headers);

    // write content to csv file
    const outputPath = path.join(basePath, 'csv-export.csv');
    try {
      await fs.writeFile(outputPath, contents);
    } catch (error) {
      // TODO PB -- suitable error (originally WriteFileError)
      throw new InputValidationError(
        `Failed to write CSV to ${basePath} ${error}`
      );
    }

    return Promise.resolve([context, tree, basePath]);
  }
}
