import * as path from 'path';

import {parse} from 'ts-command-line-args';

import {isFileExists} from '../../common/util/fs';

import {CONFIG, STRINGS} from '../config';

import type {IfVizArgs, IfVizOptions} from '../types/process-args';

const {ARGS, HELP} = CONFIG;
const {MANIFEST_NOT_FOUND, INVALID_PORT_NUMBER} = STRINGS;

/**
 * Validates `if-viz` process arguments.
 */
const validateAndParseProcessArgs = (): IfVizArgs => {
  try {
    return parse<IfVizArgs>(ARGS, HELP);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      console.log('Here are the supported flags for the `if-viz` command:');
      parse<IfVizArgs>(ARGS, {...HELP, argv: ['--help'], processExitCode: 1});
    }
    throw error;
  }
};

/**
 * Parse and validate command line arguments for `if-viz`.
 */
export const parseIfVizArgs = async (): Promise<IfVizOptions> => {
  const options = validateAndParseProcessArgs();

  const port = parseInt(options.port, 10);
  if (Number.isNaN(port) || port < 0 || port > 65535) {
    throw new Error(INVALID_PORT_NUMBER(options.port));
  }

  const manifest = path.resolve(options.manifest);
  const exists = await isFileExists(manifest);
  if (!exists) {
    throw new Error(MANIFEST_NOT_FOUND(manifest));
  }

  return {
    manifest,
    port,
    noOpen: options['no-open'],
  };
};
