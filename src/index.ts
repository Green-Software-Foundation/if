#!/usr/bin/env node
import {ModelsUniverse} from './lib/models-universe';
import {Supercomputer} from './lib/supercomputer';

import {parseProcessArgument} from './util/args';
import {ERRORS} from './util/errors';
import {andHandle} from './util/helpers';
import {validateImpl} from './util/validations';
import {openYamlFileAsObject, saveYamlFileAs} from './util/yaml';

import {STRINGS} from './config';

import {Impl} from './types/impl';

const {CliInputError} = ERRORS;

const {DISCLAIMER_MESSAGE, SOMETHING_WRONG} = STRINGS;

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
    const {inputPath, outputPath} = processParams;
    const rawImpl = await openYamlFileAsObject<Impl>(inputPath);

    // Lifecycle Validation
    const impl = validateImpl(rawImpl);

    // Lifecycle Initialize Models
    const modelsHandbook = new ModelsUniverse();
    for (const model of impl.initialize.models) {
      await modelsHandbook.writeDown(model);
    }

    // Lifecycle Computing
    const engine = new Supercomputer(impl, modelsHandbook);
    const ompl = await engine.compute();

    if (!outputPath) {
      console.log(JSON.stringify(ompl));
      return;
    }

    await saveYamlFileAs(ompl, outputPath);

    return;
  }

  return Promise.reject(new CliInputError(SOMETHING_WRONG));
};

impactEngine().catch(andHandle);
