import * as fs from 'fs/promises';

import {
  getFileName,
  isDirectoryExists,
  isFileExists,
  getYamlFiles,
  removeFileIfExists,
} from '../../../common/util/fs';

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

  describe('getFileName(): ', () => {
    it('returns the file name without extension for a file with an extension.', () => {
      const filePath = '/path/to/file/example.yaml';
      const result = getFileName(filePath);

      expect.assertions(1);
      expect(result).toBe('example');
    });

    it('returns the file name without extension for a file with multiple dots.', () => {
      const filePath = '/path/to/file/example.test.yaml';
      const result = getFileName(filePath);
      expect(result).toBe('example.test');
    });

    it('returns the file name as is if there is no extension.', () => {
      const filePath = '/path/to/file/example';
      const result = getFileName(filePath);
      expect(result).toBe('example');
    });

    it('handles file names with special characters.', () => {
      const filePath =
        '/path/to/file/complex-file.name.with-multiple.parts.yaml';
      const result = getFileName(filePath);
      expect(result).toBe('complex-file.name.with-multiple.parts');
    });

    it('handles file names with no path.', () => {
      const filePath = 'example.yaml';
      const result = getFileName(filePath);
      expect(result).toBe('example');
    });

    it('handles empty string as file path.', () => {
      const filePath = '';
      const result = getFileName(filePath);
      expect(result).toBe('');
    });
  });

  describe('getYamlFiles(): ', () => {
    it('returns an empty array if the directory is empty.', async () => {
      const fsReaddirSpy = jest.spyOn(fs, 'readdir');
      const result = await getYamlFiles('/mock-empty-directory');

      expect(result).toEqual([]);
      expect(fsReaddirSpy).toHaveBeenCalledWith('/mock-empty-directory');
    });

    it('returns YAML files in the directory', async () => {
      const fsReaddirSpy = jest.spyOn(fs, 'readdir');
      jest
        .spyOn(fs, 'lstat')
        .mockResolvedValue({isDirectory: () => false} as any);

      const result = await getYamlFiles('/mock-directory');
      expect.assertions(2);
      expect(result).toEqual([
        '/mock-directory/file1.yaml',
        '/mock-directory/file2.yml',
      ]);
      expect(fsReaddirSpy).toHaveBeenCalledWith('/mock-directory');
    });

    it('recursively finds YAML files in nested directories.', async () => {
      const fsReaddirSpy = jest.spyOn(fs, 'readdir');
      jest
        .spyOn(fs, 'lstat')
        .mockResolvedValue({isDirectory: () => false} as any);
      const result = await getYamlFiles('/mock-sub-directory');

      expect.assertions(2);
      expect(result).toEqual([
        '/mock-sub-directory/subdir/file2.yml',
        '/mock-sub-directory/file1.yaml',
      ]);
      expect(fsReaddirSpy).toHaveBeenCalledWith('/mock-directory');
    });
  });

  describe('removeFileIfExists(): ', () => {
    it('successfully delete file if exists.', async () => {
      await isFileExists('true');
      const result = await removeFileIfExists('mock-path');

      expect.assertions(1);
      expect(result).toEqual(undefined);
    });

    it('does not throw an error if the file not exists.', async () => {
      await isFileExists('false');
      const result = await removeFileIfExists('mock-path');

      expect.assertions(1);
      expect(result).toEqual(undefined);
    });
  });
});
