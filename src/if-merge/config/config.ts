import {ArgumentConfig, ParseOptions} from 'ts-command-line-args';

import {STRINGS} from '../../common/config';

import {IFMergeArgs} from '../types/process-args';

const {DISCLAIMER_MESSAGE} = STRINGS;

export const CONFIG = {
  ARGS: {
    manifests: {
      type: String,
      multiple: true,
      alias: 'm',
      description: '[path to the manifests files]',
    },
    output: {
      type: String,
      optional: true,
      alias: 'o',
      description: '[path to the merged output file]',
    },
    name: {
      type: String,
      optional: true,
      alias: 'n',
      description: '[name of the merged manifest]',
    },
    description: {
      type: String,
      optional: true,
      alias: 'd',
      description: '[decription of the merged manifest]',
    },
    help: {
      type: Boolean,
      optional: true,
      alias: 'h',
      description: '[prints out the above help instruction]',
    },
  } as unknown as ArgumentConfig<IFMergeArgs>,
  HELP: {
    helpArg: 'help',
    headerContentSections: [
      {header: 'Impact Framework', content: 'IF-Merge Helpful keywords:'},
    ],
    footerContentSections: [
      {header: 'Green Software Foundation', content: DISCLAIMER_MESSAGE},
    ],
  } as ParseOptions<any>,
};
