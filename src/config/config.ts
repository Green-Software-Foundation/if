import {ArgumentConfig} from 'ts-command-line-args';

import {ManifestProcessArgs} from '../types/process-args';

export const CONFIG = {
  impact: {
    ARGS: {
      manifest: {
        type: String,
        optional: true,
        alias: 'm',
        description: 'Path to an input manifest file.',
      },
      output: {
        type: String,
        optional: true,
        alias: 'o',
        description: 'Path to the output file where the results as saved.',
      },
      'override-params': {
        type: String,
        optional: true,
        alias: 'op',
        description: 'Path to a parameter file that overrides our defaults.',
      },
      stdout: {
        type: Boolean,
        optional: true,
        alias: 's',
        description: 'Prints output to the console.',
      },
      help: {
        type: Boolean,
        optional: true,
        alias: 'h',
        description: 'Prints this usage guide.',
      },
    } as ArgumentConfig<ManifestProcessArgs>,
    HELP: `impact 
  --manifest [path to the input file]
  --output [path to the output file]
  --stdout
  --help
  manifest: path to an input manifest
  output: path to the output file where the results as saved, if none is provided it prints to stdout.
  help: prints out the above help instruction.
  stdout: Prints output to the console.
  `,
    NO_OUTPUT: `
You have not selected an output method. To see your output data, you can choose from:
--stdout: this will print your output data to the console
--output <savepath>: this will save your output data to the given filepath (do not provide file extension)
Note that for the '--output' option you also need to define the output type in your manifest file. See https://if.greensoftware.foundation/major-concepts/manifest-file#initialize`,
  },
  GITHUB_PATH: 'https://github.com',
  NATIVE_PLUGIN: 'if-plugins',
  AGGREGATION_ADDITIONAL_PARAMS: ['timestamp', 'duration'],
};
