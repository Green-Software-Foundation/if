#!/usr/bin/env node
import {exec} from 'child_process';
import {Command} from '@commander-js/extra-typings';

import {STRINGS} from './config';
import {andHandle, getPluginsDirectoryPath} from './util/helpers';
import {run} from './run';
import {logger} from './util/logger';
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
    .requiredOption('--manifest <path>', CLI_MESSAGES.run.impl)
    .option('--output <path>', CLI_MESSAGES.run.ompl)
    .option('--override-params <path>', CLI_MESSAGES.run.overrideParams)
    .action(options => {
      run(options.manifest, options.output, options.overrideParams).catch(
        andHandle
      );
    });

  impactEngine
    .command('add')
    .alias('a')
    .description(CLI_MESSAGES.add)
    .argument('<plugins...>')
    .action(plugins => handle('add', plugins));

  impactEngine
    .command('remove')
    .alias('r')
    .description(CLI_MESSAGES.remove)
    .argument('<plugins...>')
    .action(plugins => handle('remove', plugins));

  impactEngine
    .command('list')
    .alias('l')
    .description(CLI_MESSAGES.list)
    .action(() => handle('list'));
  await impactEngine.parseAsync(process.argv);
};

const handle = (
  command: 'add' | 'remove' | 'list',
  plugins?: string[]
): void => {
  const npmCommand = `npm ${command} ${
    plugins ? plugins : ''
  } --prefix=${getPluginsDirectoryPath()}`;
  const errorPrefix = `Error ${command}ing plugins`;
  exec(npmCommand, (err, stdout, stderr) => {
    if (err) {
      logger.error(`${errorPrefix}: ${err}`);
      return;
    }

    console.log(`${stdout}`);
    if (stderr) {
      logger.info(`Stderr from command: ${stderr}`);
    }
  });
};

main();
