import type {ArgumentConfig, ParseOptions} from 'ts-command-line-args';

import {STRINGS} from '../../common/config';

import type {IfVizArgs} from '../types/process-args';

const {DISCLAIMER_MESSAGE} = STRINGS;

export const CONFIG = {
  VIZ_URL: 'https://viz.if.greensoftware.foundation',
  ARGS: {
    manifest: {
      type: String,
      alias: 'm',
      description: '[path to the output manifest file]',
    },
    port: {
      type: String,
      alias: 'p',
      description: '[port for the local file server]',
      defaultValue: '8080',
    },
    'no-open': {
      type: Boolean,
      description: '[do not open the browser automatically]',
      defaultValue: false,
    },
    help: {
      type: Boolean,
      alias: 'h',
      description: '[prints out the above help instruction]',
      optional: true,
    },
  } as ArgumentConfig<IfVizArgs>,
  HELP: {
    helpArg: 'help',
    headerContentSections: [
      {header: 'Impact Framework', content: 'IF-Viz Helpful keywords:'},
    ],
    footerContentSections: [
      {header: 'Green Software Foundation', content: DISCLAIMER_MESSAGE},
    ],
  } as ParseOptions<IfVizArgs>,
} as const;
