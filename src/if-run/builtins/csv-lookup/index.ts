/* eslint-disable eqeqeq */
import {readFile} from 'fs/promises';

import axios from 'axios';
import {z} from 'zod';
import {parse} from 'csv-parse/sync';
import {ERRORS} from '@grnsft/if-core/utils';
import {
  ExecutePlugin,
  MappingParams,
  PluginParametersMetadata,
  PluginParams,
} from '@grnsft/if-core/types';

import {PluginSettings} from '../../../common/types/manifest';
import {validate} from '../../../common/util/validations';
import {mapOutput} from '../../../common/util/helpers';

import {STRINGS} from '../../config';

const {
  FILE_FETCH_FAILED,
  FILE_READ_FAILED,
  MISSING_CSV_COLUMN,
  NO_QUERY_DATA,
  MISSING_GLOBAL_CONFIG,
} = STRINGS;

const {
  FetchingFileError,
  ReadFileError,
  MissingCSVColumnError,
  QueryDataNotFoundError,
  GlobalConfigError,
  CSVParseError,
} = ERRORS;

export const CSVLookup = (options: PluginSettings): ExecutePlugin => {
  const {
    'global-config': globalConfig,
    'parameter-metadata': parametersMetadata,
    mapping,
  } = options as {
    'global-config': any;
    'parameter-metadata': PluginParametersMetadata;
    mapping: MappingParams;
  };

  const metadata = {
    kind: 'execute',
    inputs: parametersMetadata?.inputs,
    outputs: parametersMetadata?.outputs,
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
        throw new FetchingFileError(
          FILE_FETCH_FAILED(filepath, error.response.message)
        );
      });

      return data;
    }

    return readFile(filepath).catch(error => {
      throw new ReadFileError(FILE_READ_FAILED(filepath, error));
    });
  };

  /**
   * Checks if value is invalid: `undefined`, `null` or an empty string, then sets `nan` instead.
   */
  const setNanValue = (value: any) =>
    value == null || value === '' ? 'nan' : value;

  /**
   * Converts empty values to `nan`.
   */
  const nanifyEmptyValues = (object: any) => {
    if (typeof object === 'object') {
      const keys = Object.keys(object);

      keys.forEach(key => {
        const value = object[key];
        object[key] = setNanValue(value);
      });

      return object;
    }

    return setNanValue(object);
  };

  /**
   * If `field` is missing from `object`, then reject with error.
   * Otherwise nanify empty values and return data.
   */
  const fieldAccessor = (field: string, object: any) => {
    if (!(`${field}` in object)) {
      throw new MissingCSVColumnError(MISSING_CSV_COLUMN(field));
    }

    return nanifyEmptyValues(object[field]);
  };

  /**
   * 1. If output is anything, then removes query data from csv record to escape duplicates.
   * 2. Otherwise checks if it's a miltidimensional array, then grabs multiple fields ().
   * 3. If not, then returns single field.
   * 4. In case if it's string, then
   */
  const filterOutput = (
    dataFromCSV: any,
    params: {
      output: string | string[] | string[][];
      query: Record<string, any>;
    }
  ) => {
    const {output, query} = params;

    if (output === '*') {
      const keys = Object.keys(query);

      keys.forEach(key => {
        delete dataFromCSV[key];
      });

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

  /**
   * Asserts CSV record with query data.
   */
  const withCriteria = (queryData: Record<string, any>) => (csvRecord: any) => {
    const ifMatchesCriteria = Object.keys(queryData).map(
      (key: string) => csvRecord[key] == queryData[key]
    );

    return ifMatchesCriteria.every(value => value === true);
  };

  /**
   * Parses CSV file.
   */
  const parseCSVFile = (file: string | Buffer) => {
    try {
      const parsedCSV: any[] = parse(file, {
        columns: true,
        skip_empty_lines: true,
        cast: true,
      });

      return parsedCSV;
    } catch (error: any) {
      console.error(error);
      throw new CSVParseError(error);
    }
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
    const parsedCSV = parseCSVFile(file);

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
        throw new QueryDataNotFoundError(NO_QUERY_DATA);
      }

      const result = {
        ...input,
        ...filterOutput(relatedData, {output, query}),
      };

      return mapOutput(result, mapping);
    });
  };

  /**
   * Checks for `filepath`, `query` and `output` fields in global config.
   */
  const validateGlobalConfig = () => {
    if (!globalConfig) {
      throw new GlobalConfigError(MISSING_GLOBAL_CONFIG);
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
