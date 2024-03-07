import {PluginInterface, PluginType} from './interface';

export type PluginsStorage<T extends PluginType> = {
  [key: string]: PluginInterface<T>;
};
