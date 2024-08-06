import {PluginParams} from '@grnsft/if-core/types';

import {PluginStorageInterface} from './plugin-storage';
import {Context} from '../../common/types/manifest';

export type PhasedPipeline = {
  observe?: string[];
  regroup?: string[];
  compute?: string[];
};

export type ComputeParams = {
  pluginStorage: PluginStorageInterface;
  context: Context;
  pipeline?: PhasedPipeline;
  defaults?: PluginParams;
  observe?: Boolean;
  regroup?: Boolean;
  compute?: Boolean;
};

export type Node = {
  children?: any;
  pipeline?: PhasedPipeline;
  defaults?: PluginParams;
  inputs?: PluginParams[];
  outputs?: PluginParams[];
};
