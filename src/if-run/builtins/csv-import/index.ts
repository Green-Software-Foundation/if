/* eslint-disable eqeqeq */
import {z} from 'zod';

import {ConfigParams, PluginParams} from '@grnsft/if-core/types';
import {PluginFactory} from '@grnsft/if-core/interfaces';
import {ERRORS, validate} from '@grnsft/if-core/utils';

import {STRINGS} from '../../config';

import {
  fieldAccessor,
  nanifyEmptyValues,
  parseCSVFile,
  retrieveFile,
} from '../util/helpers';

const {MISSING_CONFIG} = STRINGS;

const {ConfigError} = ERRORS;

export const CSVImport = PluginFactory({
  configValidation: (config: ConfigParams) => {
    if (!config || !Object.keys(config)?.length) {
      throw new ConfigError(MISSING_CONFIG);
    }

    const configSchema = z.object({
      filepath: z.string(),
      output: z
        .string()
        .or(z.array(z.string()))
        .or(z.array(z.array(z.string()))),
    });

    return validate<z.infer<typeof configSchema>>(configSchema, config);
  },
  implementation: async (inputs: PluginParams[], config: ConfigParams) => {
    /**
     * 1. Tries to retrieve given file (with url or local path).
     * 2. Parses given CSV.
     * 3. Filters requested information from CSV.
     */
    const {filepath, output} = config;
    const file = await retrieveFile(filepath);
    const parsedCSV = parseCSVFile(file);

    const result = parsedCSV?.map((input: PluginParams) =>
      filterOutput(input, output)
    );

    return [...inputs, ...result];
  },
});

/**
 * 1. If output is anything, then removes query data from csv record to escape duplicates.
 * 2. Otherwise checks if it's a miltidimensional array, then grabs multiple fields ().
 * 3. If not, then returns single field.
 * 4. In case if it's string, then
 */
const filterOutput = (
  dataFromCSV: any,
  output: string | string[] | string[][]
) => {
  if (output === '*') {
    return nanifyEmptyValues(dataFromCSV);
  }

  if (Array.isArray(output)) {
    /** Check if it's a multidimensional array. */
    if (Array.isArray(output[0])) {
      const result: any = {};

      output.forEach(outputField => {
        /** Check if there is no renaming request, then export as is */
        const outputTitle = outputField[1] || outputField[0];
        result[outputTitle] = fieldAccessor(outputField[0], dataFromCSV);
      });

      return result;
    }

    const outputTitle = output[1] || output[0];

    return {
      [outputTitle as string]: fieldAccessor(output[0], dataFromCSV),
    };
  }

  return {
    [output]: fieldAccessor(output, dataFromCSV),
  };
};
