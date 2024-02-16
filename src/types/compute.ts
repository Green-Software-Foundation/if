import {PluginsStorage} from './initialize';
import {PluginParams} from './interface';
import {ManifestCommon} from './manifest';

export type NodeConfig = {
  [key: string]: Record<string, any>;
};

export type Params = {
  plugins: PluginsStorage;
  context: ManifestCommon;
  pipeline?: string[];
  config?: NodeConfig;
  defaults?: PluginParams[];
};

export type Node = {
  children?: any;
  pipeline?: string[];
  config?: NodeConfig;
  defaults?: PluginParams[];
  inputs?: PluginParams[];
  outputs?: PluginParams[];
};
