#!/usr/bin/env node
/* eslint-disable no-process-exit */
import {debugLogger} from './util/debug-logger';
import {parseIfEnvArgs} from './util/args';

import {STRINGS} from '../common/config';

import {
  addTemplateManifest,
  getOptionsFromArgs,
  initializeAndInstallLibs,
} from './util/helpers';
import {logger} from '../common/util/logger';

import {EnvironmentOptions} from './types/if-env';

const {SUCCESS_MESSAGE} = STRINGS;

const IfEnv = async () => {
  // Call this function with false parameter to prevent log debug messages.
  debugLogger.overrideConsoleMethods(false);

  const commandArgs = await parseIfEnvArgs();
  const options: EnvironmentOptions = {
    folderPath: process.env.CURRENT_DIR || process.cwd(),
    install: !!commandArgs.install,
    dependencies: {},
    cwd: !!commandArgs.cwd,
  };

  if (commandArgs && commandArgs.manifest) {
    const {folderPath, install, dependencies} =
      await getOptionsFromArgs(commandArgs);
    options.folderPath = commandArgs.cwd ? options.folderPath : folderPath;
    options.install = !!install;
    options.dependencies = {...dependencies};
  }

  await initializeAndInstallLibs(options);

  if (!commandArgs || !commandArgs.manifest) {
    await addTemplateManifest(options.folderPath);
  }

  console.log(SUCCESS_MESSAGE);
  process.exit(0);
};

IfEnv().catch(error => {
  if (error instanceof Error) {
    logger.error(error);
    process.exit(2);
  }
});
