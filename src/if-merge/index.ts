#!/usr/bin/env node
/* eslint-disable no-process-exit */
import {debugLogger} from '../common/util/debug-logger';
import {logger} from '../common/util/logger';

import {parseIfMergeArgs} from './util/args';
import {mergeManifests} from './util/helpers';

import {STRINGS} from './config';

const {MERGING, SUCCESS_MESSAGE} = STRINGS;

const IfMerge = async () => {
  // Call this function with false parameter to prevent log debug messages.
  debugLogger.overrideConsoleMethods(false);

  const commandArgs = await parseIfMergeArgs();

  console.log(`${MERGING}\n`);

  await mergeManifests(commandArgs);

  console.log(SUCCESS_MESSAGE);

  process.exit(0);
};

IfMerge().catch(error => {
  if (error instanceof Error) {
    logger.error(error);
    process.exit(2);
  }
});
