import {ExecutePlugin} from '@grnsft/if-core/types';

export type PluginInterface = ExecutePlugin;

export const isExecute = (plugin: ExecutePlugin): plugin is ExecutePlugin =>
  (plugin as ExecutePlugin).metadata.kind === 'execute';
