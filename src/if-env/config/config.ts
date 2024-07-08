import {ArgumentConfig, ParseOptions} from 'ts-command-line-args';

import {IFEnvArgs} from '../types/process-args';

import {STRINGS} from '../../common/config';

const {DISCLAIMER_MESSAGE} = STRINGS;

export const CONFIG = {
  IF_ENV: {
    ARGS: {
      manifest: {
        type: String,
        optional: true,
        alias: 'm',
        description: '[path to the manifest file]',
      },
      install: {
        type: Boolean,
        optional: true,
        alias: 'i',
        description: '[command to install package.json]',
      },
      cwd: {
        type: Boolean,
        optional: true,
        alias: 'c',
        description:
          '[command to generate the package.json in the command working directory]',
      },
    } as ArgumentConfig<IFEnvArgs>,
    HELP: {
      helpArg: 'help',
      headerContentSections: [
        {header: 'Impact Framework', content: 'IF-Env Helpful keywords:'},
      ],
      footerContentSections: [
        {header: 'Green Software Foundation', content: DISCLAIMER_MESSAGE},
      ],
    } as ParseOptions<any>,
  },
};
