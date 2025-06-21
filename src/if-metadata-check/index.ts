#!/user/bin/env node

import {IFPlugin} from './types/plugin';
import {parseIFCheckMetadataArgs} from './util/args';
import {
  getParameters,
  getParametersWithMetadata,
  calculateMetadataCoverage,
} from './util/metadata-checker';
import {debugLogger} from '../common/util/debug-logger';
import {logger} from '../common/util/logger';
import {STRINGS} from './config/strings';

const {
  PERCENTAGE_COVERAGE,
  ALL_PARAMETERS_HAVE_METADATA,
  PARAMETERS_MISSING_METADATA,
} = STRINGS;

const IfCheckMetadata = async () => {
  debugLogger.overrideConsoleMethods(false);
  const {parameters, ...manifestData} = await parseIFCheckMetadataArgs();

  const parameterSet = getParameters(
    Object.values(manifestData.initialize.plugins) as IFPlugin[],
    parameters
  );
  const parameterWithMetadataSet = getParametersWithMetadata(
    Object.values(manifestData.initialize.plugins) as IFPlugin[]
  );
  const {percentage, missingParameters} = calculateMetadataCoverage(
    parameterSet,
    parameterWithMetadataSet
  );
  console.log(`${PERCENTAGE_COVERAGE} ${percentage.toFixed(2)}%`);
  if (missingParameters.length > 0) {
    console.log(PARAMETERS_MISSING_METADATA);
    missingParameters.forEach(parameter => console.log(`  - ${parameter}`));
  } else {
    console.log(ALL_PARAMETERS_HAVE_METADATA);
  }
};

IfCheckMetadata().catch(error => {
  if (error instanceof Error) logger.error(`${error.message}`);
  throw error;
});
