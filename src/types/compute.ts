import {PluginParams} from './interface';
import {Context} from './manifest';
import {PluginStorageInterface} from './plugin-storage';

export type NodeConfig = {
  [key: string]: Record<string, any>;
};

export type Params = {
  pluginStorage: PluginStorageInterface;
  context: Context;
  pipeline?: string[];
  config?: NodeConfig;
  defaults?: PluginParams;
};

export type Node = {
  children?: any;
  pipeline?: string[];
  config?: NodeConfig;
  defaults?: PluginParams;
  inputs?: PluginParams[];
  outputs?: PluginParams[];
};

export type ComputeParams = {
  context: Context;
  pluginStorage: PluginStorageInterface;
};
