import axios from 'axios';
import {parse} from 'csv-parse/sync';

import {
  isURL,
  retrieveFile,
  setNanValue,
  nanifyEmptyValues,
  fieldAccessor,
  parseCSVFile,
} from '../../../../if-run/builtins/util/csv-helpers';

import {ERRORS} from '@grnsft/if-core/utils';
import {STRINGS} from '../../../../if-run/config';

jest.mock('csv-parse/sync', () => ({
  parse: jest.fn(),
}));

const mockParse = parse as jest.Mock;

const {FILE_FETCH_FAILED, MISSING_CSV_COLUMN} = STRINGS;

const {FetchingFileError, MissingCSVColumnError, CSVParseError} = ERRORS;

jest.mock('axios');
jest.mock('fs/promises');

describe('util/helpers: ', () => {
  describe('isURL(): ', () => {
    it('returns true for valid URLs.', () => {
      const validUrls = [
        'https://www.example.com',
        'http://example.com',
        'ftp://example.com/file.csv',
        'https://subdomain.example.com/path?query=value#hash',
      ];

      validUrls.forEach(url => {
        expect(isURL(url)).toBe(true);
      });
    });

    it('returns false for invalid URLs.', () => {
      const invalidUrls = [
        'just-a-string',
        'https//example.com',
        '://missing-protocol.com',
        'www.example.com', // missing protocol
        'example', // no domain or protocol
        'https://',
      ];

      invalidUrls.forEach(url => {
        expect(isURL(url)).toBe(false);
      });
    });

    it('returns false for empty or non-string inputs.', () => {
      expect(isURL('')).toBe(false);
      // @ts-expect-error Testing non-string input
      expect(isURL(null)).toBe(false);
      // @ts-expect-error Testing non-string input
      expect(isURL(undefined)).toBe(false);
      // @ts-expect-error Testing non-string input
      expect(isURL(123)).toBe(false);
    });
  });

  describe('retrieveFile(): ', () => {
    const mockedAxiosGet = axios.get as jest.MockedFunction<typeof axios.get>;

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('fetches a file from a URL and return its data.', async () => {
      const filepath = 'https://example.com/file.txt';
      const mockData = 'file content';

      mockedAxiosGet.mockResolvedValue({data: mockData});

      const result = await retrieveFile(filepath);

      expect.assertions(2);
      expect(mockedAxiosGet).toHaveBeenCalledWith(filepath);
      expect(result).toBe(mockData);
    });

    it('throws an error when fetching a file from a URL fails.', async () => {
      const filepath = 'https://example.com/file.txt';
      const mockError = {response: {message: 'Network error'}};

      mockedAxiosGet.mockRejectedValue(mockError);

      expect.assertions(3);

      await expect(retrieveFile(filepath)).rejects.toThrow(FetchingFileError);
      await expect(retrieveFile(filepath)).rejects.toThrow(
        FILE_FETCH_FAILED(filepath, mockError.response.message)
      );
      expect(mockedAxiosGet).toHaveBeenCalledWith(filepath);
    });
  });

  describe('setNanValue(): ', () => {
    it('returns "nan" for falsy value.', () => {
      expect(setNanValue(null)).toBe('nan');
      expect(setNanValue(undefined)).toBe(undefined);
      expect(setNanValue('')).toBe('nan');
    });

    it('returns the original value for non-empty string.', () => {
      expect(setNanValue('mock')).toBe('mock');
    });

    it('returns the original value for a number.', () => {
      expect(setNanValue(42)).toBe(42);
    });

    it('returns the original value for a boolean.', () => {
      expect(setNanValue(true)).toBe(true);
      expect(setNanValue(false)).toBe(false);
    });

    it('returns the original value for an object.', () => {
      const obj = {key: 'value'};
      expect(setNanValue(obj)).toBe(obj);
    });

    it('returns the original value for an array.', () => {
      const arr = [1, 2, 3];
      expect(setNanValue(arr)).toBe(arr);
    });
  });

  describe('nanifyEmptyValues(): ', () => {
    it('converts empty values to NaN for a flat object.', () => {
      const input = {a: '', b: null, c: 5, d: 'text'};
      const expected = {a: 'nan', b: 'nan', c: 5, d: 'text'};

      expect(nanifyEmptyValues(input)).toEqual(expected);
    });

    it('handles nested objects.', () => {
      const input = {a: '', b: {c: null, d: 'text'}};
      const expected = {a: 'nan', b: {c: null, d: 'text'}};

      expect(nanifyEmptyValues(input)).toEqual(expected);
    });

    it('handles non-object input values.', () => {
      expect(nanifyEmptyValues('')).toBe('nan');
      expect(nanifyEmptyValues(42)).toBe(42);
      expect(nanifyEmptyValues('text')).toBe('text');
    });

    it('return NaN for empty objects.', () => {
      const input = {};
      const expected = {};

      expect(nanifyEmptyValues(input)).toEqual(expected);
    });
  });

  describe('fieldAccessor(): ', () => {
    const mockObject = {
      timestamp: '2023-08-06T00:00',
      duration: 3600,
      'cpu/utilization': 80,
    };

    it('returns the value of the specified field.', () => {
      const field = 'cpu/utilization';
      const expectedValue = 80;

      const result = fieldAccessor(field, mockObject);

      expect(result).toBe(expectedValue);
    });

    it('throws an error if the field does not exist in the object.', () => {
      const field = 'nonExistentField';

      expect(() => fieldAccessor(field, mockObject)).toThrow(
        MissingCSVColumnError
      );
      expect(() => fieldAccessor(field, mockObject)).toThrow(
        MISSING_CSV_COLUMN(field)
      );
    });

    it('throws an error for invalid input types.', () => {
      const invalidObject = null;
      const field = 'name';

      expect(() => fieldAccessor(field, invalidObject)).toThrow(TypeError);
    });
  });

  describe('parseCSVFile(): ', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('parses a valid CSV file string and return the parsed result.', () => {
      const csvInput =
        'timestamp,duration,cpu/utilization\n2023-08-06T00:00,3600,80\n2023-08-06T00:00,3600,90';
      const parsedResult = [
        {timestamp: '2023-08-06T00:00', duration: 3600, 'cpu/utilization': 80},
        {timestamp: '2023-08-06T00:00', duration: 3600, 'cpu/utilization': 90},
      ];

      mockParse.mockReturnValue(parsedResult);

      const result = parseCSVFile(csvInput);

      expect(result).toEqual(parsedResult);
      expect(mockParse).toHaveBeenCalledWith(csvInput, {
        columns: true,
        skip_empty_lines: true,
        cast: true,
      });
      expect(mockParse).toHaveBeenCalledTimes(1);
    });

    it('parses a valid CSV file buffer and return the parsed result.', () => {
      const csvInput = Buffer.from(
        'timestamp,duration,cpu/utilization\n2023-08-06T00:00,3600,80\n2023-08-06T00:00,3600,90'
      );
      const parsedResult = [
        {timestamp: '2023-08-06T00:00', duration: 3600, 'cpu/utilization': 80},
        {timestamp: '2023-08-06T00:00', duration: 3600, 'cpu/utilization': 90},
      ];

      mockParse.mockReturnValue(parsedResult);

      const result = parseCSVFile(csvInput);

      expect(result).toEqual(parsedResult);
      expect(mockParse).toHaveBeenCalledWith(csvInput, {
        columns: true,
        skip_empty_lines: true,
        cast: true,
      });
      expect(mockParse).toHaveBeenCalledTimes(1);
    });

    it('throws an error if parsing fails.', () => {
      const csvInput = 'invalid,csv,data';
      const mockError = new Error('Invalid CSV format');

      mockParse.mockImplementation(() => {
        throw mockError;
      });

      expect(() => parseCSVFile(csvInput)).toThrow(CSVParseError);
      expect(mockParse).toHaveBeenCalledWith(csvInput, {
        columns: true,
        skip_empty_lines: true,
        cast: true,
      });
      expect(mockParse).toHaveBeenCalledTimes(1);
    });

    it('logs the error when parsing fails.', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const csvInput = 'invalid,csv,data';
      const mockError = new Error('Invalid CSV format');

      mockParse.mockImplementation(() => {
        throw mockError;
      });

      expect(() => parseCSVFile(csvInput)).toThrow(CSVParseError);
      expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);

      consoleErrorSpy.mockRestore();
    });
  });
});
