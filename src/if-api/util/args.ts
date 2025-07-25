import {parse} from 'ts-command-line-args';

import {CONFIG, STRINGS} from '../config';
import type {IfApiArgs, IfApiOptions} from '../types/process-args';

const {ARGS, HELP} = CONFIG;
const {INVALID_PORT_NUMBER} = STRINGS;

/**
 * Validates `if-api` process arguments.
 */
const validateAndParseProcessArgs = (): IfApiArgs => {
  try {
    return parse<IfApiArgs>(ARGS, HELP);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      console.log('Here are the supported flags for the `if-api` command:');
      parse<IfApiArgs>(ARGS, {...HELP, argv: ['--help'], processExitCode: 1});
    }
    throw error;
  }
};

/**
 * Parse command line arguments for `if-api`.
 */
export const parseIfApiProcessArgs = (): IfApiOptions => {
  const options = validateAndParseProcessArgs();
  const port = parseInt(options.port, 10);
  if (Number.isNaN(port) || port < 0 || port > 65535) {
    throw new Error(INVALID_PORT_NUMBER(options.port));
  }

  return {
    debug: options.debug,
    disableExternalPluginWarning: options.disableExternalPluginWarning,
    disabledPlugins: options.disabledPlugins,
    port,
    host: options.host,
  };
};
