import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Checks if file exists with the given `filePath`.
 */
export const isFileExists = async (filePath: string) => {
  try {
    await fs.stat(filePath);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Checks if the directory exists with the given `filePath`.
 */
export const isDirectoryExists = async (directoryPath: string) => {
  try {
    await fs.access(directoryPath);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Gets all files that have either .yml or .yaml extension in the given directory.
 */
export const getYamlFiles = async (directory: string) => {
  let yamlFiles: string[] = [];

  const files = await fs.readdir(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = await fs.lstat(fullPath);

    if (stat.isDirectory()) {
      yamlFiles = yamlFiles.concat(await getYamlFiles(fullPath));
    } else {
      if (file.endsWith('.yml') || file.endsWith('.yaml')) {
        yamlFiles.push(fullPath);
      }
    }
  }

  return yamlFiles;
};

/**
 * Gets fileName from the given path without an extension.
 */
export const getFileName = (filePath: string) => {
  const baseName = path.basename(filePath);
  const extension = path.extname(filePath);
  return baseName.replace(extension, '');
};

