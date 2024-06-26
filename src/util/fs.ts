import * as fs from 'fs/promises';

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
