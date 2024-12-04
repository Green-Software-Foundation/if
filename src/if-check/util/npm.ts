import * as path from 'node:path';
import {execPromise} from '../../common/util/helpers';
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

  const ifEnvCommand = `${
    isGlobal ? 'if-env' : 'npm run if-env'
  } ${prefixFlag} -- -m ${sanitizedManifest}`;
  const ifRunCommand = `${
    isGlobal ? 'if-run' : 'npm run if-run'
  } ${prefixFlag} -- -m ${sanitizedManifest} -o ${sanitizedExecutedManifest}`;
  const ttyCommand = "node -p 'Boolean(process.stdout.isTTY)'";
  const ifDiffCommand = `${
    isGlobal ? 'if-diff' : 'npm run if-diff'
  } ${prefixFlag} -- -s ${sanitizedExecutedManifest}.yaml -t ${sanitizedManifest}`;

  const fullCommand =
    [ifEnvCommand, ifRunCommand, ttyCommand].join(' && ') +
    ` | ${ifDiffCommand}`;

  await execPromise(fullCommand, {
    cwd: process.env.CURRENT_DIR || process.cwd(),
  });

  if (!cwd) {
    await removeFileIfExists(`${manifestDirPath}/package.json`);
  }

  await removeFileIfExists(`${executedManifest}.yaml`);

  console.log(IF_CHECK_VERIFIED(path.basename(manifest)));
};
