import {spawnSync, SpawnSyncReturns} from 'child_process';

import {loadAll, dump} from 'js-yaml';
import {z} from 'zod';
import {PluginFactory} from '@grnsft/if-core/interfaces';
import {ERRORS} from '@grnsft/if-core/utils';
import {ConfigParams, PluginParams} from '@grnsft/if-core/types';

import {validate} from '../../../common/util/validations';

import {STRINGS} from '../../config';

const {ProcessExecutionError, ConfigError} = ERRORS;
const {MISSING_CONFIG} = STRINGS;

export const Shell = PluginFactory({
  configValidation: (config: ConfigParams) => {
    if (!config) {
      throw new ConfigError(MISSING_CONFIG);
    }

    const schema = z.object({
      command: z.string(),
    });

    return validate<z.infer<typeof schema>>(schema, config);
  },
  implementation: async (inputs, config) => {
    const inputWithConfig = Object.assign({}, inputs[0], config);
    const command = inputWithConfig.command;
    const inputAsString: string = dump(inputs, {indent: 2});
    const results = runModelInShell(inputAsString, command);

    return results?.outputs?.flat() as PluginParams[];
  },
});

/**
 * Runs the model in a shell. Spawns a child process to run an external IMP,
 * an executable with a CLI exposing two methods: `--execute` and `--manifest`.
 * The shell command then calls the `--command` method passing var manifest as the path to the desired manifest file.
 */
const runModelInShell = (input: string, command: string) => {
  try {
    const [executable, ...args] = command.split(' ');

    const result: SpawnSyncReturns<string> = spawnSync(executable, args, {
      input,
      encoding: 'utf8',
    });
    const outputs = loadAll(result.stdout);

    return {outputs};
  } catch (error: any) {
    throw new ProcessExecutionError(error.message);
  }
};
