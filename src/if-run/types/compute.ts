import {PluginParams} from '@grnsft/if-core/types';

import {PluginStorageInterface} from './plugin-storage';
import {Context} from '../../common/types/manifest';

/**
 * @todo: remove NodeConfig after some period
 */
export type NodeConfig = {
  [key: string]: Record<string, any>;
};

export type PhasedPipeline = {
  observe?: string[];
  regroup?: string[];
  compute?: string[];
};

export type ComputeParams = {
  pluginStorage: PluginStorageInterface;
  context: Context;
  pipeline?: PhasedPipeline;
  config?: NodeConfig;
  defaults?: PluginParams;
  observe?: Boolean;
  regroup?: Boolean;
  compute?: Boolean;
  append?: boolean;
};

export type Node = {
  children?: any;
  pipeline?: PhasedPipeline;
  config?: NodeConfig;
  defaults?: PluginParams;
  inputs?: PluginParams[];
  outputs?: PluginParams[];
};
