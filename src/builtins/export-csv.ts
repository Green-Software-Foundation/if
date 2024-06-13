import {writeFile} from 'fs/promises';
import {stringify} from 'csv-stringify/sync';

import {ERRORS} from '../util/errors';

import {STRINGS} from '../config';

import {Context} from '../types/manifest';
import {PluginParams} from '../types/interface';

const {ExhaustOutputArgError} = ERRORS;
const {CSV_EXPORT, OUTPUT_REQUIRED, EXPORTING_TO_CSV_FILE} = STRINGS;

/**
 * Extension to IF that outputs the tree in a CSV format.
 */
export const ExportCSV = () => {
  const parseOutputAndField = (outputPath: string) => {
    const validatedPath = validateOutputPath(outputPath);

    const paths = validatedPath.split('#');
    const criteria = paths[paths.length - 1];

    if (paths.length <= 1 || !criteria) {
      throw new ExhaustOutputArgError(CSV_EXPORT);
    }

    const output = paths.slice(0, paths.length - 1).join('');
    console.debug(EXPORTING_TO_CSV_FILE(output));

    return {
      output,
      criteria,
    };
  };

  /**
   * Validates output path.
   */
  const validateOutputPath = (outputPath: string) => {
    if (!outputPath) {
      throw new ExhaustOutputArgError(OUTPUT_REQUIRED);
    }

    return outputPath;
  };

  /**
   * Grabs output and criteria from cli args, then call tree walker to collect csv data.
   */
  const execute = async (tree: any, context: Context, outputPath: string) => {
    const columns = ['Path'];
    const matrix = [columns];
    const {output, criteria} = parseOutputAndField(outputPath);
    const aggregationIsEnabled = !!context.aggregation;

    /**
     * Walks through all tree branches and leaves, collecting the data
     */
    const treeWalker = (node: any, criteria: string, path = 'tree') => {
      /** Hmm aggregated, then checks if it's the first one. If so adds column, pushes the value. */
      if (node.aggregated) {
        if (path === 'tree') {
          columns.push('Aggregated');
        }

        matrix.push([`${path}.${criteria}`, node.aggregated[criteria]]);
      }

      /** So it has outputs, whats then? checks if timestamp is not there, adds one. Then appends values to it. */
      if (node.outputs) {
        node.outputs.forEach((output: PluginParams) => {
          const {timestamp} = output;

          if (!columns.includes(timestamp)) {
            columns.push(output.timestamp);
          }

          const lastRow = matrix[matrix.length - 1];

          if (aggregationIsEnabled) {
            lastRow.push(output[criteria]);
          } else {
            /** Handle without aggregation export strategy. */
            if (matrix.length === 1 || lastRow.length === columns.length) {
              matrix.push([`${path}.${criteria}`, output[criteria]]);
            } else {
              lastRow.push(output[criteria]);
            }
          }
        });
      }

      /** Ohh children? then call every one and execute. */
      if (node.children) {
        for (const child in node.children) {
          treeWalker(
            node.children[child],
            criteria,
            `${path}.children.${child}`
          );
        }
      }
    };

    treeWalker(tree, criteria);

    await writeFile(`${output}.csv`, stringify(matrix, {columns}));
  };

  return {
    execute,
    metadata: {
      kind: 'exhaust',
    },
  };
};
