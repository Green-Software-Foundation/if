import {PluginInterface} from './interface';

export type PluginsStorage = {
  [key: string]: PluginInterface;
};
