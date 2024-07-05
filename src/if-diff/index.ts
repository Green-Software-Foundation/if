#!/usr/bin/env node
/* eslint-disable no-process-exit */
import {loadIfDiffFiles} from './lib/load';
import {compare} from './lib/compare';

import {parseIfDiffArgs} from './util/args';
import {formatNotMatchingLog, parseManifestFromStdin} from './util/helpers';
import {validateManifest} from '../common/util/validations';

import {logger} from '../common/util/logger';
import {debugLogger} from '../common/util/debug-logger';

import {STRINGS} from './config';
import {STRINGS as COMMON_STRINGS} from '../common/config';

const {FAILURE_MESSAGE} = STRINGS;
const {SUCCESS_MESSAGE} = COMMON_STRINGS;

const IfDiff = async () => {
  const pipedSourceManifest = await parseManifestFromStdin();
  const {sourcePath, targetPath} = parseIfDiffArgs();

  // Call this function with false parameter to prevent log debug messages.
  debugLogger.overrideConsoleMethods(false);

  const {rawSourceManifest, rawTargetManifest} = await loadIfDiffFiles({
    targetPath,
    sourcePath,
    pipedSourceManifest,
  });
  const [sourceManifest, targetManifest] = [
    rawSourceManifest,
    rawTargetManifest,
  ].map(validateManifest);
  const result = compare(sourceManifest, targetManifest);

  if (Object.keys(result).length) {
    formatNotMatchingLog({
      message: FAILURE_MESSAGE,
      ...result,
    });

    process.exit(1);
  }

  console.log(SUCCESS_MESSAGE);
  process.exit(0);
};

IfDiff().catch(error => {
  if (error instanceof Error) {
    logger.error(error);
    process.exit(2);
  }
});
