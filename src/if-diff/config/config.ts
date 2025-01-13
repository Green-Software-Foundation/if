import {ArgumentConfig, ParseOptions} from 'ts-command-line-args';

import {STRINGS} from '../../common/config';

import {IFDiffArgs} from '../types/process-args';

const {DISCLAIMER_MESSAGE} = STRINGS;

export const CONFIG = {
  ARGS: {
    source: {
      type: String,
      optional: true,
      alias: 's',
      description: '[path to the source file]',
    },
    target: {
      type: String,
      optional: false,
      alias: 't',
      description: '[path to the target file',
    },
    help: {
      type: Boolean,
      optional: true,
      alias: 'h',
      description: '[prints out the above help instruction]',
    },
  } as ArgumentConfig<IFDiffArgs>,
  HELP: {
    helpArg: 'help',
    headerContentSections: [
      {header: 'Impact Framework', content: 'IF-Diff Helpful keywords:'},
    ],
    footerContentSections: [
      {header: 'Green Software Foundation', content: DISCLAIMER_MESSAGE},
    ],
  } as ParseOptions<any>,
};
