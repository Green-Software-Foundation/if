import {ArgumentConfig, ParseOptions} from 'ts-command-line-args';

import {STRINGS} from '../../common/config';

import {IFCheckArgs} from '../types/process-args';

const {DISCLAIMER_MESSAGE} = STRINGS;

export const CONFIG = {
  ARGS: {
    manifest: {
      type: String,
      optional: true,
      alias: 'm',
      description: '[path to the manifest file]',
    },
    directory: {
      type: String,
      optional: true,
      alias: 'd',
      description: '[path to the manifests directory]',
    },
  } as ArgumentConfig<IFCheckArgs>,
  HELP: {
    helpArg: 'help',
    headerContentSections: [
      {header: 'Impact Framework', content: 'IF-Check Helpful keywords:'},
    ],
    footerContentSections: [
      {header: 'Green Software Foundation', content: DISCLAIMER_MESSAGE},
    ],
  } as ParseOptions<any>,
};
