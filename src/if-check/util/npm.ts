import * as path from 'node:path';
import {execFileSync, type ExecFileSyncOptions} from 'child_process';
import {getFileName, removeFileIfExists} from '../../common/util/fs';
import {STRINGS} from '../config';

const {IF_CHECK_VERIFIED} = STRINGS;

/**
 * Executes a single Impact Framework command.
 */
const executeCommand = (
  command: string,
  args: readonly string[],
  executionOptions: ExecFileSyncOptions
) => {
  const commandPath = process.argv[1].replace(
    /(?<=[/\\])if-check(?:[/\\]index(?:\.[jt]s)?)?$/,
    command
  );

  return execFileSync(
    process.execPath,
    [...process.execArgv, commandPath, ...args],
    executionOptions
  );
};

/**
 * Executes a series of Impact Framework commands based on the provided manifest file.
 */
export const executeCommands = async (manifest: string) => {
  // Get fullpath of the manifest
  if (!path.isAbsolute(manifest)) {
    manifest = path.resolve(process.env.CURRENT_DIR || process.cwd(), manifest);
  }
  // Get the directory path and file name of the manifest
  const manifestDirPath = path.dirname(manifest);
  const manifestFileName = getFileName(manifest);
  // Create a path for the executed manifest file
  const executedManifest = path.join(manifestDirPath, `re-${manifestFileName}`);

  try {
    // Execute the if-env command
    executeCommand('if-env', ['-m', manifest], {
      stdio: 'ignore',
    });

    // Execute the if-run command
    executeCommand('if-run', ['-m', manifest, '-o', executedManifest], {
      stdio: 'ignore',
    });

    // Execute the if-diff command
    executeCommand(
      'if-diff',
      ['-s', `${executedManifest}.yaml`, '-t', manifest],
      {
        stdio: 'inherit',
      }
    );
  } finally {
    // Remove the package.json file if it exists
    await removeFileIfExists(`${manifestDirPath}/package.json`);
    // Remove the executed manifest file if it exists
    await removeFileIfExists(`${executedManifest}.yaml`);
  }

  console.log(IF_CHECK_VERIFIED(path.basename(manifest)));
};
