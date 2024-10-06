import {PluginInterface} from '@grnsft/if-core/types';
import {pluginStorage} from '../util/plugin-storage';

export type PluginStorage = {
  [key: string]: PluginInterface;
};

export type PluginStorageInterface = ReturnType<typeof pluginStorage>;
