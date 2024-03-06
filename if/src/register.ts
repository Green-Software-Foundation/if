import {exec} from 'child_process';
import {resolve} from 'path';
import Table from 'cli-table3';
import {logger} from './util/logger';

import util from 'util';
const execAsync = util.promisify(exec);

type Register = Array<Array<string>>;

export const pluginRegister = () => {
  const getRegister = async (includeSource?: boolean) => {
    try {
      const {stdout} = await execAsync(
        `npm list --depth=0 --json --prefix ${getPluginsDirectoryPath()}`
      );
      if (stdout) {
        return parseRegister(JSON.parse(stdout), includeSource);
      }
    } catch (err) {
      logger.error(`Error reading plugins store: ${err}`);
      return;
    }
    return [] as Register;
  };

  const parseRegister = (
    dependencies: any,
    includeSource?: boolean
  ): Register => {
    const register: Register = [];
    dependencies?.dependencies &&
      Object.entries<Record<'version' | 'resolved', string>>(
        dependencies.dependencies
      ).forEach(([key, value]) => {
        if (includeSource) {
          register.push([key, value.version, value.resolved]);
        } else {
          register.push([key, value.version]);
        }
      });
    return register;
  };

  const listPlugins = async (includeSource?: boolean) => {
    const currentRegister = await getRegister(includeSource);
    if (currentRegister === undefined) {
      return;
    }
    if (currentRegister.length === 0) {
      console.log('No plugins registered.');
      return;
    }
    const table = new Table({
      head: includeSource
        ? ['Plugin', 'Version', 'Source']
        : ['Plugin', 'Version'],
      style: {
        head: ['green'],
      },
    });
    currentRegister.forEach(entry => table.push(entry));
    console.log(table.toString());
  };

  const addPlugins = async (plugins: Array<string>) => {
    const currentRegister = await getRegister(true);
    if (currentRegister === undefined) {
      return;
    }
    const alreadyAdded = plugins.filter(plugin =>
      currentRegister.some(entry => entry[0] === plugin || entry[2] === plugin)
    );
    if (alreadyAdded.length === plugins.length) {
      console.log(
        `Plugin${plugins.length > 1 ? 's' : ''} ${plugins.join(' ')} ${
          plugins.length > 1 ? 'are' : 'is'
        } already installed.`
      );
      return;
    }
    const notAdded = plugins.filter(plugin => !alreadyAdded.includes(plugin));
    console.log(`Adding ${notAdded.join(' ')}`);
    if (alreadyAdded.length > 0) {
      console.log(
        `${alreadyAdded.join(' ')} ${
          alreadyAdded.length > 1 ? 'are' : 'is'
        } already installed.`
      );
    }
    await handle('add', notAdded);
  };

  const removePlugins = async (plugins: Array<string>) => {
    const currentRegister = await getRegister(true);
    if (currentRegister === undefined) {
      return;
    }
    const includedPlugins = plugins.filter(plugin =>
      currentRegister.some(entry => entry[0] === plugin || entry[2] === plugin)
    );
    if (includedPlugins.length === 0) {
      console.log(
        `Plugin${plugins.length > 1 ? 's' : ''} ${plugins} ${
          plugins.length > 1 ? 'are' : 'is'
        } not installed.`
      );
      return;
    }
    const notRegistered = plugins.filter(
      plugin => !includedPlugins.includes(plugin)
    );
    console.log(`Removing ${includedPlugins.join(' ')}`);
    if (notRegistered.length > 0) {
      console.log(
        `${notRegistered.join(' ')} ${
          notRegistered.length > 1 ? 'are' : 'is'
        } not installed.`
      );
    }
    await handle('remove', includedPlugins);
  };

  const handle = async (command: 'add' | 'remove', plugins: string[]) => {
    const npmCommand = `npm ${command} ${plugins.join(
      ' '
    )} --prefix=${getPluginsDirectoryPath()}`;
    try {
      await execAsync(npmCommand);
    } catch (err) {
      logger.error(
        `${`Error ${
          command === 'add' ? 'adding' : 'removing'
        } plugins`}: ${err}`
      );
    }
    console.log('Done');
  };

  return {
    addPlugins,
    removePlugins,
    listPlugins,
  };
};

export const getPluginsDirectoryPath = () => {
  return resolve(__dirname, '../../', 'plugins');
};
