#!/usr/bin/env node
/* eslint-disable no-process-exit */
import {loadIfDiffFiles} from './lib/load';
import {compare} from './lib/compare';

import {parseIfDiffArgs} from './util/args';
import {formatNotMatchingLog, parseManifestFromStdin} from './util/helpers';
import {validateManifest} from './util/validations';

import {logger} from './util/logger';
import {debugLogger} from './util/debug-logger';

import {CONFIG} from './config';

const {IF_DIFF} = CONFIG;
const {SUCCESS_MESSAGE, FAILURE_MESSAGE} = IF_DIFF;

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
