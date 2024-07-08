import {ArgumentConfig, ParseOptions} from 'ts-command-line-args';

import {STRINGS} from '../../common/config';

import {IfRunArgs} from '../types/process-args';

const {DISCLAIMER_MESSAGE} = STRINGS;

export const CONFIG = {
  IF_RUN: {
    ARGS: {
      manifest: {
        type: String,
        optional: true,
        alias: 'm',
        description: '[path to the input file]',
      },
      output: {
        type: String,
        optional: true,
        alias: 'o',
        description: '[path to the output file]',
      },
      'override-params': {
        type: String,
        optional: true,
        alias: 'p',
        description: '[path to a parameter file that overrides our defaults]',
      },
      'no-output': {
        type: Boolean,
        optional: true,
        alias: 'n',
        description: '[prevent output to the console]',
      },
      help: {
        type: Boolean,
        optional: true,
        alias: 'h',
        description: '[prints out the above help instruction]',
      },
      debug: {
        type: Boolean,
        optional: true,
        alias: 'd',
        description: '[prints out debug logs to the console]',
      },
    } as ArgumentConfig<IfRunArgs>,
    HELP: {
      helpArg: 'help',
      headerContentSections: [
        {header: 'Impact Framework', content: 'Helpful keywords:'},
      ],
      footerContentSections: [
        {header: 'Green Software Foundation', content: DISCLAIMER_MESSAGE},
      ],
    } as ParseOptions<any>,
  },
  GITHUB_PATH: 'https://github.com',
  NATIVE_PLUGIN: 'if-plugins',
  AGGREGATION_ADDITIONAL_PARAMS: ['timestamp', 'duration'],
};
