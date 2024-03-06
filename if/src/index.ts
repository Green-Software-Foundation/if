#!/usr/bin/env node
import {Command} from '@commander-js/extra-typings';

import {STRINGS} from './config';
import {andHandle} from './util/helpers';
import {run} from './run';
import {pluginRegister} from './register';

const packageJson = require('../package.json');

const {CLI_MESSAGES} = STRINGS;

const main = async () => {
  const impactEngine = new Command();

  impactEngine.version(
    packageJson.version,
    '-v, --version',
    CLI_MESSAGES.version
  );

  impactEngine
    .command('run', {isDefault: true})
    .description(CLI_MESSAGES.run.description)
    .requiredOption('-m, --manifest <path>', CLI_MESSAGES.run.manifest)
    .option('-o, --output <path>', CLI_MESSAGES.run.output)
    .option('-p, --override-params <path>', CLI_MESSAGES.run.overrideParams)
    .action(options => {
      run(options.manifest, options.output, options.overrideParams).catch(
        andHandle
      );
    });

  const {addPlugins, removePlugins, listPlugins} = pluginRegister();

  impactEngine
    .command('add')
    .alias('a')
    .description(CLI_MESSAGES.add)
    .argument('<plugins...>')
    .action(async plugins => await addPlugins(plugins));

  impactEngine
    .command('remove')
    .alias('r')
    .description(CLI_MESSAGES.remove)
    .argument('<plugins...>')
    .action(async plugins => await removePlugins(plugins));

  impactEngine
    .command('list')
    .alias('l')
    .description(CLI_MESSAGES.list.description)
    .option('-s, --source', CLI_MESSAGES.list.source)
    .action(async options => await listPlugins(options.source));

  await impactEngine.parseAsync(process.argv);
};

main();
