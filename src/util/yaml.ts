import {readFile, writeFile} from 'fs/promises';

import * as YAML from 'js-yaml';

import {ImpactYaml} from '../types/yaml';

/**
 * Reads and parses `yaml` file to object.
 */
export const openYamlFileAsObject = async (
  filePath: string
): Promise<ImpactYaml> => {
  const yamlFileBuffer = await readFile(filePath, 'utf8');

  return YAML.load(yamlFileBuffer) as ImpactYaml;
};

/**
 * Saves given `yaml` dump as a file.
 */
export const saveYamlFileAs = (object: ImpactYaml, name: string) => {
  const path = `${__dirname}/${name}`;
  const yamlString = YAML.dump(object);

  return writeFile(path, yamlString);
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
