#!/usr/bin/env node
/* eslint-disable no-process-exit */
import * as YAML from 'js-yaml';

import {parseManifestFromStdin} from '../common/util/helpers';
import {debugLogger} from '../common/util/debug-logger';
import {Manifest} from '../common/types/manifest';
import {logger} from '../common/util/logger';

import {executeCsv, getManifestData} from './util/helpers';
import {parseIfCsvArgs} from './util/args';
import {CsvOptions} from './types/csv';

const IfCsv = async () => {
  // Call this function with false parameter to prevent log debug messages.
  debugLogger.overrideConsoleMethods(false);

  const pipedManifest = await parseManifestFromStdin();
  const {manifest, output, params} = await parseIfCsvArgs();
  const resolvedManifest = manifest || pipedManifest;

  if (resolvedManifest) {
    const manifestData = pipedManifest
      ? ((await YAML.load(pipedManifest!)) as Manifest)
      : await getManifestData(manifest!);

    const options: CsvOptions = {
      tree: manifestData.tree,
      context: manifestData,
      outputPath: output,
      params,
    };
    const result = await executeCsv(options);

    if (!output && result) {
      console.log(result);
    }
  }

  process.exit(0);
};

IfCsv().catch(error => {
  if (error instanceof Error) {
    logger.error(error);
    process.exit(2);
  }
});
