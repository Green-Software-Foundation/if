import {ExhaustPluginInterface, PluginInterface} from './interface';

export type PluginsStorage = {
  [key: string]: PluginInterface;
};

export type ExhaustPluginStorage = {
  [key: string]: ExhaustPluginInterface;
};
