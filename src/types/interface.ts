import {GroupByConfig} from './group-by';

export type PluginParams = Record<string, any>;

export type ExecutePlugin = {
  execute: (
    inputs: PluginParams[],
    config?: Record<string, any>
  ) => PluginParams[];
  metadata: {
    kind: string;
  };
  [key: string]: any;
};

export type GroupByPlugin = {
  execute: (inputs: PluginParams[], config: GroupByConfig) => {children: any};
  metadata: {
    kind: string;
  };
  [key: string]: any;
};

export type PluginInterface = ExecutePlugin | GroupByPlugin;

export const isExecute = (plugin: PluginInterface): plugin is ExecutePlugin =>
  (plugin as ExecutePlugin).metadata.kind === 'execute';

export const isGroupBy = (plugin: PluginInterface): plugin is GroupByPlugin =>
  (plugin as GroupByPlugin).metadata.kind === 'groupby';
