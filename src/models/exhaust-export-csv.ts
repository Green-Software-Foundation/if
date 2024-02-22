import * as fs from 'fs/promises';
import {ERRORS} from '../util/errors';
import {ExhaustPluginInterface} from './exhaust-plugin-interface';
const {InputValidationError, WriteFileError} = ERRORS;

export const ExhaustExportCsv = (config: any): ExhaustPluginInterface => {
  const extractConfigParams = () => {
    const outputPath: string =
      'output-path' in config
        ? config['output-path']
        : (() => {
            throw new InputValidationError("Config does not have 'outputPath'");
          })();
    return [outputPath];
  };

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
    const [subFlatMap, subHeaders] = extractFlatMapAndHeaders(value, fullPath);
    if (Object.keys(subFlatMap).length > 0) {
      Object.entries(subFlatMap).forEach(([subKey, value]) => {
        flatMap[subKey] = value;
      });
      subHeaders.forEach(subHeader => {
        headers.add(subHeader);
      });
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

  const writeOutputFile = async (csvString: string, outputPath: string) => {
    try {
      await fs.writeFile(outputPath, csvString);
    } catch (error) {
      throw new WriteFileError(
        `Failed to write CSV to ${outputPath}: ${error}`
      );
    }
  };

  const execute: (tree: any) => void = async aggregatedTree => {
    const [outputPath] = extractConfigParams();
    const [extractredFlatMap, extractedHeaders] =
      extractFlatMapAndHeaders(aggregatedTree);
    const ids = new Set(
      Object.keys(extractredFlatMap).map(key => extractIdHelper(key))
    );
    const csvString = getCsvString(extractredFlatMap, extractedHeaders, ids);
    writeOutputFile(csvString, outputPath);
  };
  return {execute};
};
