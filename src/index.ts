#!/usr/bin/env node
import {ModelsUniverse} from './lib/models-universe';
import {Supercomputer} from './lib/supercomputer';

import {parseProcessArgument} from './util/args';
import {ERRORS} from './util/errors';
import {andHandle} from './util/helpers';
import {validateImpl} from './util/validations';
import {openYamlFileAsObject, saveYamlFileAs} from './util/yaml';

import {PARAMETERS, STRINGS} from './config';
import * as fs from 'node:fs';
import {Impl} from './types/impl';
import {Parameters} from './types/units';

const {CliInputError} = ERRORS;

const {DISCLAIMER_MESSAGE, OVERRIDE_WARNING, SOMETHING_WRONG} = STRINGS;

/**
 * 1. Parses yml input/output process arguments.
 * 2. Opens yaml file as an object.
 * 3. Validates given impl to match basic structure.
 * 4. Initializes requested models.
 * 5. Initializes graph, does computing.
 * 6. Saves processed object as a yaml file.
 * @example run `npm run impact-engine -- --impl ./test.yml --ompl ./result.yml`
 */
const impactEngine = async () => {
  console.log(DISCLAIMER_MESSAGE);

  const processParams = parseProcessArgument();

  if (processParams) {
    const {paramPath, inputPath, outputPath} = processParams;
    const rawImpl = await openYamlFileAsObject<Impl>(inputPath);
    if (!(paramPath === null || paramPath === undefined)) {
      console.log(OVERRIDE_WARNING);
    }

    /** Lifecycle Validation */
    const impl = validateImpl(rawImpl);
    let parameters = PARAMETERS as Parameters;

    /**
     * Checks if override params path is passed, then reads that file.
     * Then checks if param is new, then appends it to existing parameters.
     * Otherwise warns user about rejected overriding.
     */
    if (paramPath) {
      const newParams = JSON.parse(fs.readFileSync(paramPath, 'utf-8'));
      parameters = newParams;
    }

    /** Lifecycle Initialize Models */
    const modelsHandbook = await new ModelsUniverse().bulkWriteDown(
      impl.initialize.models
    );

    /** Lifecycle Computing */
    const computeInstance = await new Supercomputer(
      impl,
      modelsHandbook,
      parameters
    );

    computeInstance.synchronizeParameters(parameters);
    const outputData = await computeInstance.compute();

    if (!outputPath) {
      console.log(JSON.stringify(outputData));
      return;
    }
    await saveYamlFileAs(outputData, outputPath);

    return;
  }

  return Promise.reject(new CliInputError(SOMETHING_WRONG));
};

impactEngine().catch(andHandle);
