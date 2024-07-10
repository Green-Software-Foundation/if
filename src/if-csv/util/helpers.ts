import * as fs from 'fs/promises';
import {stringify} from 'csv-stringify/sync';
import {PluginParams} from '@grnsft/if-core/types';
import {ERRORS} from '@grnsft/if-core/utils';

import {load} from '../../common/lib/load';

import {CsvOptions} from '../types/csv';
import {STRINGS} from '../config';

const {FAILURE_MESSAGE_OUTPUTS} = STRINGS;
const {ManifestValidationError} = ERRORS;

/**
 * Gets the folder path of the manifest file, dependencies from manifest file and install argument from the given arguments.
 */
export const getManifestData = async (manifest: string) => {
  const {rawManifest} = await load(manifest);
  const children = rawManifest.tree.children;

  if ((children.child || children['child-0']).outputs) {
    return rawManifest;
  }

  throw new ManifestValidationError(FAILURE_MESSAGE_OUTPUTS);
};

/**
 * Executes a CSV generation based on the provided tree structure, context, output path, and params.
 */
export const executeCsv = async (options: CsvOptions) => {
  const {tree, context, outputPath, params} = options;
  const columns = ['Path'];
  const matrix = [columns];
  const aggregationIsEnabled = !!context.aggregation;

  const traverseTree = (node: any, params: string, path = 'tree') => {
    if (node.aggregated) {
      if (path === 'tree') {
        columns.push('Aggregated');
      }
      matrix.push([`${path}.${params}`, node.aggregated[params]]);
    }

    if (node.outputs) {
      node.outputs.forEach((output: PluginParams) => {
        const {timestamp} = output;

        if (!columns.includes(timestamp)) {
          columns.push(timestamp);
        }

        const lastRow = matrix[matrix.length - 1];

        if (aggregationIsEnabled) {
          lastRow.push(output[params]);
        } else {
          if (matrix.length === 1 || lastRow.length === columns.length) {
            matrix.push([`${path}.${params}`, output[params]]);
          } else {
            lastRow.push(output[params]);
          }
        }
      });
    }

    if (node.children) {
      Object.keys(node.children).forEach(childKey => {
        traverseTree(
          node.children![childKey],
          params,
          `${path}.children.${childKey}`
        );
      });
    }
  };

  traverseTree(tree, params);

  const csvString = stringify(matrix, {columns});

  if (!outputPath) {
    return csvString;
  }

  return await fs.writeFile(`${outputPath}.csv`, csvString);
};
