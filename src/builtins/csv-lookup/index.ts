import {readFile} from 'fs/promises';

import axios from 'axios';
import {z} from 'zod';
import {parse} from 'csv-parse/sync';

import {ExecutePlugin, PluginParams} from '../../types/interface';

import {validate} from '../../util/validations';
import {ERRORS} from '../../util/errors';

const {ConfigNotFoundError, FileNotFoundError, InputValidationError} = ERRORS;

export const CSVLookup = (globalConfig: any): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
  };

  /**
   * Checks if given string is URL.
   */
  const isURL = (filepath: string) => {
    try {
      new URL(filepath);
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * Checks if given `filepath` is url, then tries to fetch it.
   * Otherwise tries to read file.
   */
  const retrieveFile = async (filepath: string) => {
    if (isURL(filepath)) {
      const {data} = await axios.get(filepath).catch(error => {
        throw new FileNotFoundError(`Something went wrong while reading the file: ${filepath}.
        ${error.response.message}`);
      });

      return data;
    }

    return readFile(filepath).catch(error => {
      throw new FileNotFoundError(
        `Something went wrong while reading the file: ${filepath}. 
${error}`
      );
    });
  };

  /**
   * Converts empty values to `nan`.
   */
  const nanifyEmptyValues = (object: any) => {
    if (typeof object === 'object') {
      const keys = Object.keys(object);

      keys.forEach(key => {
        const value = object[key];
        object[key] = value || 'nan';
      });

      return object;
    }

    return object || 'nan';
  };

  /**
   * 1. If output is anything, then returns data.
   * 2. Otherwise checks if it's an miltidimensional, then grabs multiple fields.
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
          result[outputField[1]] = nanifyEmptyValues(
            dataFromCSV[outputField[0]]
          );
        });

        return result;
      }

      return {
        [(output as string[])[1]]: nanifyEmptyValues(dataFromCSV[output[0]]),
      };
    }

    return {
      [output]: nanifyEmptyValues(dataFromCSV[output]),
    };
  };

  /**
   * Asserts CSV record with query data.
   */
  const withCriteria = (queryData: Record<string, any>) => (csvRecord: any) => {
    const ifMatchesCriteria = Object.keys(queryData).map(
      // eslint-disable-next-line eqeqeq
      (key: string) => csvRecord[key] == queryData[key]
    );

    return ifMatchesCriteria.every(value => value === true);
  };

  /**
   * 1. Validates global config.
   * 2. Tries to retrieve given file (with url or local path).
   * 3. Parses given CSV.
   * 4. Filters requested information from CSV.
   */
  const execute = async (inputs: PluginParams[]) => {
    const safeGlobalConfig = validateGlobalConfig();
    const {filepath, query, output} = safeGlobalConfig;

    const file = await retrieveFile(filepath);

    try {
      const parsedCSV: any[] = parse(file, {
        columns: true,
        skip_empty_lines: true,
      });

      return inputs.map(input => {
        /** Collects query values from input. */
        const queryData: any = {};
        const queryKeys = Object.keys(query);
        queryKeys.forEach(queryKey => {
          const queryValue = query[queryKey];
          queryData[queryKey] = input[queryValue];
        });

        /** Gets related data from CSV. */
        const relatedData = parsedCSV.find(withCriteria(queryData));

        if (!relatedData) {
          throw new InputValidationError(
            'One or more of the given query parameters are not found in the target CSV file column headers.'
          );
        }

        return {
          ...input,
          ...filterOutput(relatedData, output),
        };
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new InputValidationError(`Error happened while parsing given CSV file: ${filepath}
${error}`);
      }

      throw error;
    }
  };

  /**
   * Checks for `filepath`, `query` and `output` fields in global config.
   */
  const validateGlobalConfig = () => {
    if (!globalConfig) {
      throw new ConfigNotFoundError('Global config is not provided.');
    }

    const globalConfigSchema = z.object({
      filepath: z.string(),
      query: z.record(z.string(), z.string()),
      output: z
        .string()
        .or(z.array(z.string()))
        .or(z.array(z.array(z.string()))),
    });

    return validate<z.infer<typeof globalConfigSchema>>(
      globalConfigSchema,
      globalConfig
    );
  };

  return {
    metadata,
    execute,
  };
};
