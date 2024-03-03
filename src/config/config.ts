import {ArgumentConfig} from 'ts-command-line-args';

import {ManifestProcessArgs} from '../types/process-args';

export const CONFIG = {
  impact: {
    ARGS: {
      manifest: {
        type: String,
        optional: true,
        alias: 'i',
        description: 'Path to an input manifest file.',
      },
      output: {
        type: String,
        optional: true,
        description:
          'Path to the output file where the results as saved, if none is provided it prints to stdout.',
      },
      'override-params': {
        type: String,
        optional: true,
        description: 'Path to a parameter file that overrides our defaults.',
      },
      format: {
        type: String,
        optional: true,
        description:
          'The output file format. default to yaml but if csv is specified then it formats the outputs as a csv file for loading into another program.',
        defaultValue: 'yaml',
      },
      verbose: {
        type: Boolean,
        optional: true,
        description:
          'How much information to output about the calculation to aid investigation and debugging.',
      },
      help: {
        type: Boolean,
        optional: true,
        alias: 'h',
        description: 'Prints this usage guide.',
      },
    } as ArgumentConfig<ManifestProcessArgs>,
    HELP: `impact 
  -manifest [path to the input file]
  -output [path to the output file]
  -format [yaml|csv] 
  -verbose
  -help 
  manifest: path to an input manifest
  output: path to the output file where the results as saved, if none is provided it prints to stdout.
  format: the output file format. default to yaml but if csv is specified then it formats the outputs as a csv file for loading into another program.
  verbose: how much information to output about the calculation to aid investigation and debugging.
  help: prints out the above help instruction.
  `,
  },
  GITHUB_PATH: 'https://github.com',
  NATIVE_PLUGIN: 'if-plugins',
  AGGREGATION_ADDITIONAL_PARAMS: ['timestamp', 'duration'],
};
