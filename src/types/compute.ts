import {PluginsStorage} from './initialize';
import {PluginParams} from './interface';
import {ManifestCommon} from './manifest';

export type Params = {
  plugins: PluginsStorage;
  context: ManifestCommon;
  pipeline?: string[];
  config?: Record<string, any>;
  defaults?: PluginParams[];
};

export type Node = {
  children?: any;
  pipeline?: string[];
  config?: Record<string, any>;
  defaults?: PluginParams[];
  inputs?: PluginParams[];
  outputs?: PluginParams[];
};
