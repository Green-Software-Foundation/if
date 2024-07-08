import * as path from 'node:path';

import {execPromise} from '../../common/util/helpers';
import {getFileName, removeFileIfExists} from '../../common/util/fs';

import {STRINGS} from '../config';

const {IF_CHECK_VERIFIED} = STRINGS;

/**
 * Executes a series of npm commands based on the provided manifest file.
 */
export const executeCommands = async (manifest: string, cwd: boolean) => {
  // TODO: After release remove isGlobal and appropriate checks
  const isGlobal = !!process.env.npm_config_global;
  const manifestDirPath = path.dirname(manifest);
  const manifestFileName = getFileName(manifest);
  const executedManifest = path.join(manifestDirPath, `re-${manifestFileName}`);
  const prefixFlag =
    process.env.CURRENT_DIR && process.env.CURRENT_DIR !== process.cwd()
      ? `--prefix=${path.relative(process.env.CURRENT_DIR!, process.cwd())}`
      : '';
  const ifEnv = `${
    isGlobal ? `if-env ${prefixFlag}` : `npm run if-env ${prefixFlag} --`
  } -m ${manifest}`;
  const ifEnvCommand = cwd ? `${ifEnv} -c` : ifEnv;
  const ifRunCommand = `${
    isGlobal ? `if-run ${prefixFlag}` : `npm run if-run ${prefixFlag} --`
  } -m ${manifest} -o ${executedManifest}`;
  const ifDiffCommand = `${
    isGlobal ? `if-diff ${prefixFlag}` : `npm run if-diff ${prefixFlag} --`
  } -s ${executedManifest}.yaml -t ${manifest}`;
  const ttyCommand = " node -p 'Boolean(process.stdout.isTTY)'";

  await execPromise(
    `${ifEnvCommand} && ${ifRunCommand} && ${ttyCommand} | ${ifDiffCommand}`,
    {
      cwd: process.env.CURRENT_DIR || process.cwd(),
    }
  );

  if (!cwd) {
    await removeFileIfExists(`${manifestDirPath}/package.json`);
  }

  await removeFileIfExists(`${executedManifest}.yaml`);

  console.log(IF_CHECK_VERIFIED(path.basename(manifest)));
};
