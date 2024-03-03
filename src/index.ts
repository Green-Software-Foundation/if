#!/usr/bin/env node
import {exec} from 'child_process';
import {Command} from '@commander-js/extra-typings';
import {resolve} from 'path';

import {STRINGS} from './config';
import {andHandle} from './util/helpers';
import {run} from './run';
const packageJson = require('../package.json');

const {CLI_MESSAGES} = STRINGS;

const rootDirectory = resolve(__dirname, '..');
const pluginDirectory = resolve(rootDirectory, 'plugins');

async function main() {
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
}

function handle(command: 'add' | 'remove' | 'list', plugins?: string[]): void {
  const npmCommand = `npm ${command} ${
    plugins ? plugins : ''
  } --workspace=${pluginDirectory} --prefix=${rootDirectory}`;
  const errorPrefix = `Error ${command}ing plugins`;
  exec(npmCommand, (err, stdout, stderr) => {
    if (err) {
      console.error(`${errorPrefix}: ${err}`);
      return;
    }

    console.log(`${stdout}`);
    if (stderr) {
      console.log(`Stderr: ${stderr}`);
    }
  });
}

main();
