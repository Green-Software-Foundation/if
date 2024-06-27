#!/usr/bin/env node
/* eslint-disable no-process-exit */
import * as fs from 'fs/promises';
import * as path from 'path';

import {logger} from './util/logger';
import {parseIfCheckArgs} from './util/args';
import {logStdoutFailMessage} from './util/helpers';
import {getYamlFiles} from './util/fs';

import {STRINGS} from './config';
import {executeCommands} from './util/npm';

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

      logStdoutFailMessage(error);

      await fs.unlink(`${manifestDirPath}/package.json`);
      await fs.unlink(executedFile);
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

        logStdoutFailMessage(error);
        await fs.unlink(executedFile);
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
