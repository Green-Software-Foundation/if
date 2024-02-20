import * as path from 'path';
import * as fs from 'fs/promises';
import {ERRORS} from '../util/errors';
import {ExhaustPluginInterface} from './exhaust-plugin';
const {WriteFileError} = ERRORS;
// TODO PB -- need a way for the user to configure the file name, maybe add a field to 'exhaust' options in the manifest?
const OUTPUT_FILE_NAME = 'if-csv-export.csv'; // default

const extractIdHelper = (key: string): string => {
  const parts = key.split('.');
  parts.pop();
  return parts.join('.');
};

const getCsvString = (
  dict: {[key: string]: any},
  headers: Set<string>,
  ids: Set<string>
): string => {
  const csvRows: string[] = [];
  csvRows.push(['id', ...headers].join(','));
  ids.forEach(id => {
    const rowData = [id];
    headers.forEach(header => {
      const value = dict[`${id}.${header}`] ?? '';
      rowData.push(value.toString());
    });
    csvRows.push(rowData.join(','));
  });
  return csvRows.join('\n');
};

const writeOutputFile = async (csvString: string, basePath: string) => {
  const csvPath = path.join(basePath, OUTPUT_FILE_NAME);
  try {
    await fs.writeFile(csvPath, csvString);
  } catch (error) {
    throw new WriteFileError(`Failed to write CSV to ${csvPath}: ${error}`);
  }
};

const extractFlatDictAndHeaders = (
  obj: any,
  prefix = ''
): [{[key: string]: any}, Set<string>] => {
  const headers: Set<string> = new Set();
  const flatDict: {[key: string]: any} = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        const [subFlatDict, subHeaders] = extractFlatDictAndHeaders(
          value,
          fullPath
        );
        if (Object.keys(subFlatDict).length > 0) {
          for (const subKey in subFlatDict) {
            if (Object.prototype.hasOwnProperty.call(subFlatDict, subKey)) {
              flatDict[subKey] = subFlatDict[subKey];
            }
          }
          subHeaders.forEach(subHeader => headers.add(subHeader));
        }
      } else {
        if (fullPath.includes('outputs')) {
          headers.add(key);
          flatDict[fullPath] = value;
        }
      }
    }
  }
  return [flatDict, headers];
};

export const ExhaustExportCsv = (): ExhaustPluginInterface => {
  const execute: (
    context: any,
    tree: any,
    basePath: string
  ) => Promise<[any, any, string]> = async (
    context,
    aggregatedTree,
    basePath
  ) => {
    // TODO PB -- need a way for the user to configure the headers (projection), maybe add a field to 'exhaust' options in the manifest?
    const [extractredFlatDict, extractedHeaders] =
      extractFlatDictAndHeaders(aggregatedTree);
    const ids = new Set(
      Object.keys(extractredFlatDict).map(key => extractIdHelper(key))
    );
    const csvString = getCsvString(extractredFlatDict, extractedHeaders, ids);
    writeOutputFile(csvString, basePath);
    // TODO PB -- is what we want to return?
    return Promise.resolve([context, aggregatedTree, basePath]);
  };
  return {execute};
};
