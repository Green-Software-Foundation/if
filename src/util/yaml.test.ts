import {describe, expect, it, jest} from '@jest/globals';

import {checkIfFileIsYaml, openYamlFileAsObject, saveYamlFileAs} from './yaml';

jest.mock('fs/promises', () => require('../__mocks__/fs'));

describe('util/yaml: ', () => {
  describe('checkIfFileIsYaml(): ', () => {
    it('returns false, in case of not yaml file.', () => {
      const fileName = 'mock-filename';

      const check = checkIfFileIsYaml(fileName);
      expect(check).toBeFalsy();
    });

    it('returns true, in case of `yml` file.', () => {
      const fileName = 'mock-filename.yml';

      const check = checkIfFileIsYaml(fileName);
      expect(check).toBeTruthy();
    });

    it('returns true, in case of `yaml` file.', () => {
      const fileName = 'mock-filename.yaml';

      const check = checkIfFileIsYaml(fileName);
      expect(check).toBeTruthy();
    });
  });

  describe('openYamlFileAsObject(): ', () => {
    it('should load and serve yaml as object.', async () => {
      expect.assertions(2);

      const result = await openYamlFileAsObject('mock');
      const expectedType = 'object';
      const expectedYamlName = 'gsf-demo';

      expect(typeof result).toBe(expectedType);
      expect(result.name).toBe(expectedYamlName);
    });
  });

  describe('saveYamlFileAs(): ', () => {
    it('saves yaml file with passed object and path.', async () => {
      const object = {
        name: 'mock-name',
      };
      const pathToFile = 'mock-pathToFile';

      await saveYamlFileAs(object, pathToFile);
    });

    it('throws error in case if something wrong with path.', async () => {
      const object = {
        name: 'mock-name',
      };
      const pathToFile = 'reject'; // Mock value for rejection.

      const expectedErrorMessage = 'Wrong file path';

      try {
        await saveYamlFileAs(object, pathToFile);
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toBe(expectedErrorMessage);
        }
      }
    });
  });
});
