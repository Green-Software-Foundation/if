import {ExhaustPluginInterface, PluginInterface} from './interface';

export type PluginsStorage = {
  [key: string]: PluginInterface;
};

export type ExhaustPluginsStorage = {
  [key: string]: ExhaustPluginInterface;
};
