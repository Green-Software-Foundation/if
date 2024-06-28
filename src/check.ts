#!/usr/bin/env node
/* eslint-disable no-process-exit */
import * as path from 'path';

import {logger} from './util/logger';
import {logStdoutFailMessage} from './util/helpers';
import {parseIfCheckArgs} from './util/args';
import {getYamlFiles, removeFileIfExists} from './util/fs';

import {STRINGS} from './config';
import {executeCommands} from './util/npm';

const {CHECKING, DIRECTORY_YAML_FILES_NOT_FOUND} = STRINGS;

const IfCheck = async () => {
  const commandArgs = await parseIfCheckArgs();

  console.log(`${CHECKING}\n`);

  if (commandArgs.manifest) {
    const manifest = commandArgs.manifest;

    try {
      await executeCommands(manifest, false);
    } catch (error: any) {
      const fileName = path.basename(manifest);
      const executedFile = manifest
        .replace(fileName, `re-${fileName}`)
        .replace('yml', 'yaml');
      const manifestDirPath = path.dirname(manifest);

      logStdoutFailMessage(error, fileName);

      await removeFileIfExists(`${manifestDirPath}/package.json`);
      await removeFileIfExists(executedFile);
    }
  } else {
    const directory = commandArgs.directory;
    const files = await getYamlFiles(directory!);

    if (files.length === 0) {
      console.log(DIRECTORY_YAML_FILES_NOT_FOUND);
      process.exit(1);
    }

    for await (const file of files) {
      const fileName = path.basename(file);
      console.log(fileName);

      try {
        await executeCommands(file, true);
      } catch (error: any) {
        const fileName = path.basename(file);
        const executedFile = file
          .replace(fileName, `re-${fileName}`)
          .replace('yml', 'yaml');

        logStdoutFailMessage(error, fileName);

        await removeFileIfExists(executedFile);
      }
    }
  }
};

IfCheck().catch(error => {
  if (error instanceof Error) {
    logger.error(error);
    process.exit(2);
  }
});
