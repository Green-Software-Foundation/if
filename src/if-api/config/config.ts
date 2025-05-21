import type {ArgumentConfig, ParseOptions} from 'ts-command-line-args';

import {STRINGS} from '../../common/config';

import type {IfApiArgs} from '../types/process-args';

const {DISCLAIMER_MESSAGE} = STRINGS;

/**
 * Configuration for if-api.
 */
export const CONFIG = {
  ARGS: {
    debug: {
      type: Boolean,
      alias: 'd',
      description: 'Print debug logs to the console',
      defaultValue: false,
    },
    disableExternalPluginWarning: {
      type: Boolean,
      alias: 'w',
      description: 'Disable external plugin warning',
      defaultValue: false,
    },
    disabledPlugins: {
      type: String,
      alias: 'f',
      description: 'Filename that contains plugin names to be disabled',
      optional: true,
    },
    port: {
      type: String,
      alias: 'p',
      description: 'Port to listen on',
      defaultValue: process.env.PORT ?? '3000',
    },
    host: {
      type: String,
      alias: 'b',
      description: 'Host to listen on',
      defaultValue: process.env.HOST ?? 'localhost',
    },
    help: {
      type: Boolean,
      alias: 'h',
      description: 'Show help',
      optional: true,
    },
  } as ArgumentConfig<IfApiArgs>,
  HELP: {
    helpArg: 'help',
    headerContentSections: [
      {header: 'Impact Framework', content: 'Helpful keywords:'},
    ],
    footerContentSections: [
      {header: 'Green Software Foundation', content: DISCLAIMER_MESSAGE},
    ],
  } as ParseOptions<IfApiArgs>,
} as const;
