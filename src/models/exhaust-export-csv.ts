import * as path from 'path';
import * as fs from 'fs/promises';
import {ERRORS} from '../util/errors';
import {ExhaustPluginInterface} from './exhaust-plugin';
const {MakeDirectoryError} = ERRORS;

export const ExhaustExportCsv = (): ExhaustPluginInterface => {
  const execute: (
    context: any,
    tree: any,
    basePath: string
  ) => Promise<[any, any, string]> = async (context, tree, basePath) => {
    // create directory in base path, if doesnt exist
    try {
      await fs.mkdir(basePath, {recursive: true});
    } catch (error) {
      throw new MakeDirectoryError(
        `Failed to write CSV to ${basePath} ${error}`
      );
    }

    // determine headers
    const headers = Object.keys(tree[0]);

    // create csv content from tree with headers
    const contents = [
      headers.join(','),
      ...tree.map((row: {[x: string]: any}) =>
        headers.map(fieldName => row[fieldName]).join(',')
      ),
    ].join('\r\n');

    // write content to csv file
    const outputPath = path.join(basePath, 'csv-export.csv');
    try {
      await fs.writeFile(outputPath, contents);
    } catch (error) {
      throw new MakeDirectoryError(
        `Failed to write CSV to ${basePath} ${error}`
      );
    }

    return Promise.resolve([context, tree, basePath]);
  };

  return {execute};
};
