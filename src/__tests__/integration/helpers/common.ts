import {exec} from 'node:child_process';
import {promisify} from 'node:util';

export const execPromise = promisify(exec);

export const getJSONFromText = (text: string) => {
  const jsonRegex = /\{[^]*\}/;
  const jsonMatch = text.match(jsonRegex);

  if (jsonMatch) {
    const jsonString = jsonMatch[0];

    return JSON.parse(jsonString);
  } else {
    throw new Error('No JSON found in the log.');
  }
};
