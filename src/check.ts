#!/usr/bin/env node
/* eslint-disable no-process-exit */
import * as path from 'path';

import {logger} from './util/logger';
import {logStdoutFailMessage} from './util/helpers';
import {parseIfCheckArgs} from './util/args';
import {getYamlFiles, removeFileIfExists} from './util/fs';

import {STRINGS} from './config';
import {executeCommands} from './util/npm';

const {
  CHECKING,
  DIRECTORY_YAML_FILES_NOT_FOUND,
  IF_CHECK_VERIFICATION_FAILURES,
  IF_CHECK_SUMMARY_LOG,
  IF_CHECK_EXECUTING,
} = STRINGS;

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
    const failedLogs = {count: 0, message: ''};
    const directory = commandArgs.directory;
    const files = await getYamlFiles(directory!);

    if (files.length === 0) {
      console.log(DIRECTORY_YAML_FILES_NOT_FOUND);
      process.exit(1);
    }

    for await (const file of files) {
      const fileRelativePath = path.relative(
        process.env.CURRENT_DIR || process.cwd(),
        file
      );
      console.log(IF_CHECK_EXECUTING(fileRelativePath));

      try {
        await executeCommands(file, true);
      } catch (error: any) {
        const fileName = path.basename(file);
        const executedFile = file
          .replace(fileName, `re-${fileName}`)
          .replace('yml', 'yaml');

        const failedFilesLog = logStdoutFailMessage(error, fileName);
        failedLogs.message = failedLogs.message.concat(failedFilesLog);
        failedLogs.count++;

        await removeFileIfExists(executedFile);
      }
    }

    if (failedLogs.count > 0) {
      const passedFilesCount = files.length - failedLogs.count;

      console.log(IF_CHECK_VERIFICATION_FAILURES);
      console.log(failedLogs.message);
      console.log(IF_CHECK_SUMMARY_LOG(passedFilesCount, files.length));
      process.exit(1);
    }
  }
};

IfCheck().catch(error => {
  if (error instanceof Error) {
    logger.error(error);
    process.exit(2);
  }
});
