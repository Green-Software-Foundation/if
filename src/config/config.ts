import {ArgumentConfig} from 'ts-command-line-args';

import {RimplProcessArgs} from '../types/process-args';

export const CONFIG = {
  MODEL_IDS: {
    BOAVIZTA_CPU: 'org.boavizta.cpu.sci',
    BOAVIZTA_CLOUD: 'org.boavizta.cloud.sci',
    AVEVA: 'aveva',
    EMEM: 'e-mem',
    ESHOPPEN: 'org.gsf.eshoppen',
    ESHOPPEN_CPU: 'org.gsf.eshoppen-cpu',
    ESHOPPEN_MEM: 'org.gsf.eshoppen-mem',
    ESHOPPEN_NET: 'org.gsf.eshoppen-net',
    SCI_ACCENTURE: 'org.gsf.sci-o',
    CCF: 'ccf.cloud.sci',
    SCI: 'org.gsf.sci',
    SCI_E: 'sci-e',
    SCI_M: 'org.gsf.sci-m',
    SCI_O: 'org.gsf.sci-o',
    SHELL_MODEL: 'shellModel',
    TEADS_AWS: 'teads.cloud.sci',
    TEADS_CURVE: 'teads.curve',
    WATT_TIME: 'org.wattime.grid',
    CLOUD_INSTANCE_METADATA: 'org.gsf.cloud-instance-metadata',
  },
  RIMPL: {
    ARGS: {
      impl: {
        type: String,
        optional: true,
        alias: 'i',
        description: 'Path to an input IMPL file.',
      },
      ompl: {
        type: String,
        optional: true,
        description:
          'Path to the output IMPL file where the results as saved, if none is provided it prints to stdout.',
      },
      format: {
        type: String,
        optional: true,
        description:
          'The output file format. default to yaml but if csv is specified then it formats the impacts as a csv file for loading into another program.',
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
    } as ArgumentConfig<RimplProcessArgs>,
    HELP: `rimpl 
  -impl [path to the input impl file]
  -ompl [path to the output impl file]
  -format [yaml|csv] 
  -verbose
  -help 
  impl: path to an input IMPL file
  ompl: path to the output IMPL file where the results as saved, if none is provided it prints to stdout.
  format: the output file format. default to yaml but if csv is specified then it formats the impacts as a csv file for loading into another program.
  verbose: how much information to output about the calculation to aid investigation and debugging.
  help: prints out the above help instruction.
  `,
  },
};
