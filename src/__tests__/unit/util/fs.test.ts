import {
  getFileName,
  isDirectoryExists,
  isFileExists,
  removeFileFromDirectory,
} from '../../../util/fs';

jest.mock('fs/promises', () => require('../../../__mocks__/fs'));

describe('util/fs: ', () => {
  describe('isFileExists(): ', () => {
    it('returns true if the file exists.', async () => {
      const result = await isFileExists('true');

      expect.assertions(1);
      expect(result).toEqual(true);
    });

    it('returns fale if the file does not exist.', async () => {
      const result = await isFileExists('false');

      expect.assertions(1);
      expect(result).toEqual(false);
    });
  });

  describe('isDirectoryExists(): ', () => {
    it('returns true if directory exists.', async () => {
      const result = await isDirectoryExists('true');

      expect.assertions(1);
      expect(result).toEqual(true);
    });

    it('returns false if directory does not exist.', async () => {
      const result = await isDirectoryExists('false');

      expect.assertions(1);
      expect(result).toEqual(false);
    });
  });

  describe('removeFileFromDirectory(): ', () => {
    it('returns true if directory exists.', async () => {
      const result = await removeFileFromDirectory('true');

      expect.assertions(1);
      expect(result).toEqual(undefined);
    });

    it('returns false if directory does not exist.', async () => {
      expect.assertions(1);

      try {
        await removeFileFromDirectory('false');
      } catch (error) {
        expect(error).toEqual(new Error('File not found.'));
      }
    });
  });

  describe('getFileName(): ', () => {
    it('should return the file name without extension for a file with an extension', () => {
      const filePath = '/path/to/file/example.yaml';
      const result = getFileName(filePath);

      expect.assertions(1);
      expect(result).toBe('example');
    });

    it('should return the file name without extension for a file with multiple dots', () => {
      const filePath = '/path/to/file/example.test.yaml';
      const result = getFileName(filePath);
      expect(result).toBe('example.test');
    });

    it('should return the file name as is if there is no extension', () => {
      const filePath = '/path/to/file/example';
      const result = getFileName(filePath);
      expect(result).toBe('example');
    });

    it('should handle file names with special characters', () => {
      const filePath =
        '/path/to/file/complex-file.name.with-multiple.parts.yaml';
      const result = getFileName(filePath);
      expect(result).toBe('complex-file.name.with-multiple.parts');
    });

    it('should handle file names with no path', () => {
      const filePath = 'example.yaml';
      const result = getFileName(filePath);
      expect(result).toBe('example');
    });

    it('should handle empty string as file path', () => {
      const filePath = '';
      const result = getFileName(filePath);
      expect(result).toBe('');
    });

    it('should handle file paths with leading and trailing spaces', () => {
      const filePath = '  /path/to/file/example.yaml  ';
      const result = getFileName(filePath.trim());
      expect(result).toBe('example');
    });
  });
});
