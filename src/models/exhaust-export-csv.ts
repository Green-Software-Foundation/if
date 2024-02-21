import * as path from 'path';
import * as fs from 'fs/promises';
import {ERRORS} from '../util/errors';
import {ExhaustPluginInterface} from './exhaust-plugin';
const {WriteFileError} = ERRORS;
// TODO PB -- need a way for the user to configure the file name, maybe add a field to 'exhaust' options in the manifest?
const OUTPUT_FILE_NAME = 'if-csv-export.csv'; // default

export const ExhaustExportCsv = (): ExhaustPluginInterface => {
  const handleLeafValue = (
    value: any,
    fullPath: string,
    key: any,
    flatMap: {[key: string]: any},
    headers: Set<string>
  ) => {
    if (fullPath.includes('outputs')) {
      headers.add(key);
      flatMap[fullPath] = value;
    }
  };

  const handleNodeValue = (
    value: any,
    fullPath: string,
    flatMap: {[key: string]: any},
    headers: Set<string>
  ) => {
    const [subFlatMap, subHeaders] = extractFlatMapAndHeaders(
      value,
      fullPath
    );
    if (Object.keys(subFlatMap).length > 0) {
      Object.entries(subFlatMap).forEach(([subKey, value]) => {
        if (subKey in subFlatMap) {
          flatMap[subKey] = value;
        }
      });
      subHeaders.forEach(subHeader => headers.add(subHeader));
    }
  };

  const handleKey = (
    value: any,
    key: any,
    prefix: string,
    flatMap: {[key: string]: any},
    headers: Set<string>
  ) => {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object') {
      handleNodeValue(value, fullPath, flatMap, headers);
    } else {
      handleLeafValue(value, fullPath, key, flatMap, headers);
    }
  };

  const extractFlatMapAndHeaders = (
    tree: any,
    prefix = ''
  ): [{[key: string]: any}, Set<string>] => {
    const headers: Set<string> = new Set();
    const flatMap: {[key: string]: any} = [];
    for (const key in tree) {
      if (key in tree) {
        handleKey(tree[key], key, prefix, flatMap, headers);
      }
    }
    return [flatMap, headers];
  };

  const extractIdHelper = (key: string): string => {
    const parts = key.split('.');
    parts.pop();
    return parts.join('.');
  };

  const getCsvString = (
    map: {[key: string]: any},
    headers: Set<string>,
    ids: Set<string>
  ): string => {
    const csvRows: string[] = [];
    csvRows.push(['id', ...headers].join(','));
    ids.forEach(id => {
      const rowData = [id];
      headers.forEach(header => {
        const value = map[`${id}.${header}`] ?? '';
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

  const execute: (tree: any, basePath: string) => void = async (
    aggregatedTree,
    basePath
  ) => {
    // TODO PB -- need a way for the user to configure the headers (projection), maybe add a field to 'exhaust' options in the manifest?
    const [extractredFlatMap, extractedHeaders] =
      extractFlatMapAndHeaders(aggregatedTree);
    const ids = new Set(
      Object.keys(extractredFlatMap).map(key => extractIdHelper(key))
    );
    const csvString = getCsvString(extractredFlatMap, extractedHeaders, ids);
    writeOutputFile(csvString, basePath);
  };
  return {execute};
};
