import {ArgumentConfig, ParseOptions} from 'ts-command-line-args';

import {STRINGS} from '../../common/config';

import {IFCsvArgs} from '../types/process-args';

const {DISCLAIMER_MESSAGE} = STRINGS;

export const CONFIG = {
  ARGS: {
    manifest: {
      type: String,
      optional: true,
      alias: 'm',
      description: '[path to the manifest file]',
    },
    output: {
      type: String,
      optional: true,
      alias: 'o',
      description: '[path to the csv output file]',
    },
    params: {
      type: String,
      alias: 'p',
      description: '[parameter to export]',
    },
  } as ArgumentConfig<IFCsvArgs>,
  HELP: {
    helpArg: 'help',
    headerContentSections: [
      {header: 'Impact Framework', content: 'IF-Csv Helpful keywords:'},
    ],
    footerContentSections: [
      {header: 'Green Software Foundation', content: DISCLAIMER_MESSAGE},
    ],
  } as ParseOptions<any>,
};
