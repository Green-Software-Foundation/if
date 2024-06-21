#!/usr/bin/env node
/* eslint-disable no-process-exit */
import * as path from 'path';

import {logger} from './util/logger';
import {parseIfCheckArgs} from './util/args';
import {execPromise} from './util/helpers';
import {getFileName, getYamlFiles, removeFileFromDirectory} from './util/fs';

import {STRINGS} from './config';

const {CHECKING} = STRINGS;

const IfCheck = async () => {
  const commandArgs = await parseIfCheckArgs();

  console.log(`${CHECKING}\n`);

  if (commandArgs.manifest) {
    const manifest = commandArgs.manifest;

    try {
      await executeCommands(manifest, false);
    } catch (error: any) {
      const fileName = path.basename(manifest);
      const executedFile = manifest.replace(fileName, `re-${fileName}`);
      const manifestDirPath = path.dirname(manifest);

      logFailureMessage(error);

      await removeFileFromDirectory(`${manifestDirPath}/package.json`);
      await removeFileFromDirectory(executedFile);
    }
  } else {
    const directory = commandArgs.directory;
    const files = await getYamlFiles(directory!);

    for await (const file of files) {
      const fileName = path.basename(file);
      console.log(fileName);

      try {
        await executeCommands(file, true);
      } catch (error: any) {
        const fileName = path.basename(file);
        const executedFile = file.replace(fileName, `re-${fileName}`);

        logFailureMessage(error);
        await removeFileFromDirectory(executedFile);
      }
    }
  }
};

const executeCommands = async (manifest: string, cwd: boolean) => {
  // TODO: After release remove isGlobal and apropriate checks
  const isGlobal = !!process.env.npm_config_global;
  const manifestDirPath = path.dirname(manifest);
  const manifestFileName = getFileName(manifest);
  const executedManifest = path.join(manifestDirPath, `re-${manifestFileName}`);
  const ifEnv = `${isGlobal ? 'if-env' : 'npm run if-env --'} -m ${manifest}`;
  const ifEnvCommand = cwd ? `${ifEnv} -c` : ifEnv;
  const ifRunCommand = `${
    isGlobal ? 'if-run' : 'npm run if-run --'
  } -m ${manifest} -o ${executedManifest}`;
  const ifDiffCommand = `${
    isGlobal ? 'if-diff' : 'npm run if-diff --'
  }  -s ${executedManifest}.yaml -t ${manifest}`;
  const ttyCommand = " node -p 'Boolean(process.stdout.isTTY)'";

  const result = await execPromise(
    `${ifEnvCommand} && ${ifRunCommand} && ${ttyCommand} | ${ifDiffCommand}`,
    {
      cwd: process.env.CURRENT_DIR || process.cwd(),
    }
  );

  if (!cwd) {
    await removeFileFromDirectory(`${manifestDirPath}/package.json`);
  }

  await removeFileFromDirectory(`${executedManifest}.yaml`);

  if (result.stdout) {
    const logs = result.stdout.split('\n\n');
    const successMessage = logs[logs.length - 1];

    console.log(successMessage);
  }
};

const logFailureMessage = (error: any) => {
  const stdout = error.stdout;
  const logs = stdout.split('\n\n');
  const failMessage = logs[logs.length - 1];

  console.log(failMessage);
};

IfCheck().catch(error => {
  if (error instanceof Error) {
    logger.error(error);
    process.exit(2);
  }
});
