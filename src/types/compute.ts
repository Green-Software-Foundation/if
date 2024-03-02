import {PluginsStorage} from './initialize';
import {PluginParams} from './interface';
import {Context} from './manifest';

export type NodeConfig = {
  [key: string]: Record<string, any>;
};

export type Params = {
  plugins: PluginsStorage;
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
  plugins: PluginsStorage;
};
