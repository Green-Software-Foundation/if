#!/usr/bin/env node
/* eslint-disable no-process-exit */
import {createInterface} from 'node:readline/promises';
import {exec, execFile, execFileSync} from 'child_process';
import * as path from 'path';
import {promisify} from 'util';

/**
 * Promise version of Node's `exec` and `execFile` from `child-process`.
 */
export const execPromise = promisify(exec);
export const execFilePromise = promisify(execFile);

/**
 * Prepends process path to given `filePath`.
 */
export const prependFullFilePath = (filePath: string) => {
  return path.resolve(process.env.CURRENT_DIR || process.cwd(), filePath);
};

/**
 * Checks if there is data piped, then collects it.
 * Otherwise returns empty string.
 */
const collectPipedData = async () => {
  if (process.stdin.isTTY) {
    return '';
  }

  const readline = createInterface({
    input: process.stdin,
  });

  const data: string[] = [];

  for await (const line of readline) {
    data.push(line);
  }

  return data.join('\n');
};

/**
 * Checks if there is piped data, tries to parse yaml from it.
 * Returns empty string if haven't found anything.
 */
export const parseManifestFromStdin = async () => {
  const pipedSourceManifest = await collectPipedData();

  if (!pipedSourceManifest) {
    return '';
  }

  const regex = /# start((?:.*\n)+?)# end/;
  const match = regex.exec(pipedSourceManifest);

  if (!match) {
    return '';
  }

  return match![1];
};

/**
 * Runs the --help command when the entered command is incorrect.
 */
export const runHelpCommand = (command: string) => {
  console.log(`Here are the supported flags for the \`${command}\` command:`);

  execFileSync(process.execPath, [...process.execArgv, process.argv[1], '-h'], {
    stdio: 'inherit',
  });

  process.exit(1);
};
