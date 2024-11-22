import * as fs from 'fs/promises';
import * as path from 'path';

import * as YAML from 'js-yaml';
import {ERRORS} from '@grnsft/if-core/utils';

const {ReadFileError, WriteFileError} = ERRORS;

/**
 * Reads and parses `yaml` file to object.
 */
export const openYamlFileAsObject = async <T>(filePath: string): Promise<T> => {
  try {
    const yamlFileBuffer = await fs.readFile(filePath, 'utf8');

    return YAML.load(yamlFileBuffer) as T;
  } catch (error: any) {
    throw new ReadFileError(error.message);
  }
};

/**
 * Saves given `yaml` dump as a file.
 */
export const saveYamlFileAs = async (object: any, pathToFile: string) => {
  try {
    const dirPath = path.dirname(pathToFile);
    await fs.mkdir(dirPath, {recursive: true});
    const yamlString = YAML.dump(object, {noRefs: true});

    return fs.writeFile(pathToFile, yamlString);
  } catch (error: any) {
    throw new WriteFileError(error.message);
  }
};

/**
 * Checks if given `fileName` is yaml.
 */
export const checkIfFileIsYaml = (fileName: string) => {
  const yamlFileTypes = ['yaml', 'yml'];
  const splittedParts = fileName.split('.');
  const lastIndex = splittedParts.length - 1;
  const extension = splittedParts[lastIndex];

  return yamlFileTypes.includes(extension);
};
