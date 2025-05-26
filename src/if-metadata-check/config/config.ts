import {ArgumentConfig} from 'ts-command-line-args';
import {IFCheckMetadataArgs} from '../types/process-args';

export const CONFIG = {
  ARGS: {
    manifest: {
      type: String,
      alias: 'm',
      description: 'Path of the manifest file',
    },
    parameters: {
      type: String,
      alias: 'p',
      description: 'List of parameters to check',
      multiple: true,
      defaultValue: [],
    },
    help: {
      type: Boolean,
      alias: 'h',
      description: 'Prints out the help instruction',
      optional: true,
    },
  } as ArgumentConfig<IFCheckMetadataArgs>,
};
