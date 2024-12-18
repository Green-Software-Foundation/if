import {readFile} from 'fs/promises';
import axios from 'axios';
import {parse} from 'csv-parse/sync';
import {ERRORS} from '@grnsft/if-core/utils';

import {STRINGS} from '../../config';

const {FILE_FETCH_FAILED, FILE_READ_FAILED, MISSING_CSV_COLUMN} = STRINGS;

const {FetchingFileError, ReadFileError, MissingCSVColumnError, CSVParseError} =
  ERRORS;

/**
 * Checks if given string is URL.
 */
export const isURL = (filepath: string) => {
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
export const retrieveFile = async (filepath: string) => {
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
export const setNanValue = (value: any) =>
  value === null || value === '' ? 'nan' : value;

/**
 * Converts empty values to `nan`.
 */
export const nanifyEmptyValues = (object: any) => {
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
export const fieldAccessor = (field: string, object: any) => {
  if (!(`${field}` in object)) {
    throw new MissingCSVColumnError(MISSING_CSV_COLUMN(field));
  }

  return nanifyEmptyValues(object[field]);
};

/**
 * Parses CSV file.
 */
export const parseCSVFile = (file: string | Buffer) => {
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
