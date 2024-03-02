import fs from 'node:fs/promises';

/**
 * Reads and parses json file.
 */
export const readAndParseJson = async <T>(paramPath: string): Promise<T> => {
  const file = await fs.readFile(paramPath, 'utf-8');

  return JSON.parse(file) as T;
};
