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
export const executeCommands = async (manifest: string, cwd: boolean) => {
  const isGlobal = !!process.env.npm_config_global;
  const manifestDirPath = path.dirname(manifest);
  const manifestFileName = getFileName(manifest);
  const executedManifest = path.join(manifestDirPath, `re-${manifestFileName}`);

  const prefixFlag =
    process.env.CURRENT_DIR && process.env.CURRENT_DIR !== process.cwd()
      ? `--prefix=${path.relative(process.env.CURRENT_DIR!, process.cwd())}`
      : '';

  const sanitizedManifest = escapeShellArg(manifest);
  const sanitizedExecutedManifest = escapeShellArg(executedManifest);

  const ifEnvCommand = [
    isGlobal ? 'if-env' : 'npm',
    ...(isGlobal ? [] : ['run', 'if-env']),
    '--',
    ...(prefixFlag === '' ? [] : [prefixFlag]),
    '-m',
    sanitizedManifest,
  ];

  const ifRunCommand = [
    isGlobal ? 'if-run' : 'npm',
    ...(isGlobal ? [] : ['run', 'if-run']),
    '--',
    ...(prefixFlag === '' ? [] : [prefixFlag]),
    '-m',
    sanitizedManifest,
    '-o',
    sanitizedExecutedManifest,
  ];

  const ttyCommand = ['node', '-p', 'Boolean(process.stdout.isTTY)'];
  const ifDiffCommand = [
    isGlobal ? 'if-diff' : 'npm',
    ...(isGlobal ? [] : ['run', 'if-diff']),
    '--',
    ...(prefixFlag === '' ? [] : [prefixFlag]),
    '-s',
    `${sanitizedExecutedManifest}.yaml`,
    '-t',
    sanitizedManifest,
  ];

  execFileSync(ifEnvCommand[0], ifEnvCommand.slice(1), {
    cwd: process.env.CURRENT_DIR || process.cwd(),
    shell: true,
  });

  execFileSync(ifRunCommand[0], ifRunCommand.slice(1), {
    cwd: process.env.CURRENT_DIR || process.cwd(),
  });

  execFileSync(ttyCommand[0], ttyCommand.slice(1), {
    cwd: process.env.CURRENT_DIR || process.cwd(),
  });

  const ttyResult = execFileSync(ttyCommand[0], ttyCommand.slice(1), {
    cwd: process.env.CURRENT_DIR || process.cwd(),
  });

  const tty = ttyResult && ttyResult.toString().trim();
  const fullCommand = `${tty === 'true' ? 'tty |' : ''} ${ifDiffCommand.join(
    ' '
  )}`;

  execFileSync(fullCommand, {
    cwd: process.env.CURRENT_DIR || process.cwd(),
    stdio: 'inherit',
    shell: true,
  });

  if (!cwd) {
    await removeFileIfExists(`${manifestDirPath}/package.json`);
  }

  await removeFileIfExists(`${executedManifest}.yaml`);

  console.log(IF_CHECK_VERIFIED(path.basename(manifest)));
};
