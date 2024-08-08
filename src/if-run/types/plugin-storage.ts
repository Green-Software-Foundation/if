import {pluginStorage} from '../util/plugin-storage';
import {PluginInterface} from './interface';

export type PluginStorage = {
  [key: string]: PluginInterface;
};

export type PluginStorageInterface = ReturnType<typeof pluginStorage>;
