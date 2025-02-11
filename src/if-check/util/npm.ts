import * as path from 'node:path';
import {execFileSync} from 'child_process';
import {getFileName, removeFileIfExists} from '../../common/util/fs';
import {STRINGS} from '../config';

const {IF_CHECK_VERIFIED} = STRINGS;

/**
 * Escapes shell characters that could be dangerous in a command.
 */
const escapeShellArg = (str: string) => str.replace(/([`$\\&;|*?<>])/g, '\\$1');

/**
 * Executes a series of npm commands based on the provided manifest file.
 */
export const executeCommands = async (manifest: string) => {
  // Determine if the npm command should be run globally
  const isGlobal = !!process.env.npm_config_global;
  // Get the directory path and file name of the manifest
  const manifestDirPath = path.dirname(manifest);
  const manifestFileName = getFileName(manifest);
  // Create a path for the executed manifest file
  const executedManifest = path.join(manifestDirPath, `re-${manifestFileName}`);

  // Determine the prefix flag if the CURRENT_DIR environment variable is set and different from the current working directory
  const prefixFlag =
    process.env.CURRENT_DIR && process.env.CURRENT_DIR !== process.cwd()
      ? `--prefix=${path.relative(process.env.CURRENT_DIR!, process.cwd())}`
      : '';

  // Escape shell characters in the manifest paths
  const sanitizedManifest = escapeShellArg(manifest);
  const sanitizedExecutedManifest = escapeShellArg(executedManifest);

  // Construct the if-env command
  const ifEnvCommand = [
    isGlobal ? 'if-env' : 'npm',
    ...(isGlobal ? [] : ['run', 'if-env']),
    isGlobal ? '' : '--',
    ...(prefixFlag === '' ? [] : [prefixFlag]),
    '-m',
    sanitizedManifest,
  ];

  // Construct the if-run command
  const ifRunCommand = [
    isGlobal ? 'if-run' : 'npm',
    ...(isGlobal ? [] : ['run', 'if-run']),
    isGlobal ? '' : '--',
    ...(prefixFlag === '' ? [] : [prefixFlag]),
    '-m',
    sanitizedManifest,
    '-o',
    sanitizedExecutedManifest,
  ];

  // Construct the tty command to check if the process is running in a TTY context
  const ttyCommand = ['node', '-p', 'Boolean(process.stdout.isTTY)'];

  // Construct the if-diff command
  const ifDiffCommand = [
    isGlobal ? 'if-diff' : 'npm',
    ...(isGlobal ? [] : ['run', 'if-diff']),
    isGlobal ? '' : '--',
    ...(prefixFlag === '' ? [] : [prefixFlag]),
    '-s',
    `${sanitizedExecutedManifest}.yaml`,
    '-t',
    sanitizedManifest,
  ];

  const executionOptions = {
    cwd: process.env.CURRENT_DIR || process.cwd(),
  };

  // Execute the if-env command
  execFileSync(ifEnvCommand[0], ifEnvCommand.slice(1), {
    ...executionOptions,
    shell: true,
  });

  // Execute the if-run command
  execFileSync(ifRunCommand[0], ifRunCommand.slice(1), executionOptions);

  // Execute the tty command to check if the process is running in a TTY context
  execFileSync(ttyCommand[0], ttyCommand.slice(1), executionOptions);

  // Get the result of the tty command
  const ttyResult = execFileSync(
    ttyCommand[0],
    ttyCommand.slice(1),
    executionOptions
  );

  // Determine if the process is running in a TTY context
  const tty = ttyResult && ttyResult.toString().trim();
  // Construct the full command to execute if-diff, optionally piping through tty
  const fullCommand = `${tty === 'true' ? 'tty |' : ''} ${ifDiffCommand.join(
    ' '
  )}`;

  // Execute the full command
  execFileSync(fullCommand, {
    ...executionOptions,
    stdio: 'inherit',
    shell: true,
  });

  // Remove the package.json file if it exists
  await removeFileIfExists(`${manifestDirPath}/package.json`);
  // Remove the executed manifest file if it exists
  await removeFileIfExists(`${executedManifest}.yaml`);

  console.log(IF_CHECK_VERIFIED(path.basename(manifest)));
};
