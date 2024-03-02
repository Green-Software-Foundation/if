import {exec} from 'node:child_process';
import {promisify} from 'node:util';

export const execPromise = promisify(exec);

const stripAnsi = (text: string) => {
  const pattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
  ].join('|');

  const ansiRegex = new RegExp(pattern, 'g');

  return text.replaceAll(ansiRegex, '');
};

export const getJSONFromText = (text: string) => {
  const textWithoutAnsi = stripAnsi(text);
  const jsonRegex = /\{[^]*\}/;
  const jsonMatch = textWithoutAnsi.match(jsonRegex);

  if (jsonMatch) {
    const jsonString = jsonMatch[0];

    return JSON.parse(jsonString);
  } else {
    throw new Error('No JSON found in the log.');
  }
};
