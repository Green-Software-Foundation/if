import {exhaustPluginStorage, pluginStorage} from '../util/plugin-storage';
import {ExhaustPluginInterface, PluginInterface} from './interface';

export type PluginStorage = {
  [key: string]: PluginInterface;
};

export type PluginStorageInterface = ReturnType<typeof pluginStorage>;

export type ExhaustPluginsStorage = {
  [key: string]: ExhaustPluginInterface;
};

export type ExhaustPluginStorageInterface = ReturnType<
  typeof exhaustPluginStorage
>;
