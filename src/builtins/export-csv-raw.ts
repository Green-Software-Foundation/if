import * as fs from 'fs/promises';

import {ERRORS} from '@grnsft/if-core';

import {STRINGS} from '../config';

import {ExhaustPluginInterface} from '../types/exhaust-plugin-interface';
import {Context} from '../types/manifest';

const {ExhaustOutputArgError, WriteFileError} = ERRORS;
const {OUTPUT_REQUIRED, WRITE_CSV_ERROR, EXPORTING_RAW_CSV_FILE} = STRINGS;

export const ExportCSVRaw = (): ExhaustPluginInterface => {
  /**
   * handle a tree leaf, where there are no child nodes, by adding it as key->value pair to the flat map
   * and capturing key as a header
   */
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

  /**
   * handle a tree node, recursively traverse the children and append their results to the flat map and captured headers
   */
  const handleNodeValue = (
    value: any,
    fullPath: string,
    flatMap: Record<string, any>,
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

  /**
   * Handles a key at the top level of the tree
   */
  const handleKey = (
    value: any,
    key: any,
    prefix: string,
    flatMap: Record<string, any>,
    headers: Set<string>
  ) => {
    const fullPath = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object') {
      return handleNodeValue(value, fullPath, flatMap, headers);
    }

    return handleLeafValue(value, fullPath, key, flatMap, headers);
  };

  /**
   * Recursively extract a flat map and headers from the hierarcial tree.
   */
  const extractFlatMapAndHeaders = (
    tree: any,
    prefix = ''
  ): [Record<string, any>, Set<string>] => {
    const headers: Set<string> = new Set();
    const flatMap: Record<string, any> = [];

    for (const key in tree) {
      if (key in tree) {
        handleKey(tree[key], key, prefix, flatMap, headers);
      }
    }

    return [flatMap, headers];
  };

  /**
   * extract the id of the key, that is removing the last token (which is the index).
   * in this manner, multiple keys that identical besides their index share the same id.
   */
  const extractIdHelper = (key: string): string => {
    const parts = key.split('.');
    parts.pop();

    return parts.join('.');
  };

  /**
   * generate a CSV formatted string based on a flat key->value map, headers and ids
   */
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

  /**
   * write the given string content to a file at the provided path
   */
  const writeOutputFile = async (content: string, outputPath: string) => {
    try {
      await fs.writeFile(`${outputPath}.csv`, content);
    } catch (error) {
      throw new WriteFileError(WRITE_CSV_ERROR(outputPath, error));
    }
  };

  /**
   * export the provided tree content to a CSV file, represented in a flat structure
   */
  const execute = async (tree: any, _context: Context, outputPath: string) => {
    if (!outputPath) {
      throw new ExhaustOutputArgError(OUTPUT_REQUIRED);
    }

    console.debug(EXPORTING_RAW_CSV_FILE(outputPath));

    const [extractredFlatMap, extractedHeaders] =
      extractFlatMapAndHeaders(tree);
    const ids = new Set(
      Object.keys(extractredFlatMap).map(key => extractIdHelper(key))
    );
    const csvString = getCsvString(extractredFlatMap, extractedHeaders, ids);

    await writeOutputFile(csvString, outputPath);
  };

  return {execute};
};
