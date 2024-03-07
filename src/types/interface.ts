import {Context} from './manifest';

export type PluginParams = Record<string, any>;

export type PluginType = 'execute' | 'groupby' | 'exhaust';

export interface PluginInterface<T extends PluginType> {
  execute: T extends 'execute'
    ? (inputs: PluginParams[], config?: Record<string, any>) => PluginParams[]
    : T extends 'groupby'
    ? (inputs: PluginParams[], config: {group: string[]}) => {children: any}
    : T extends 'exhaust'
    ? (tree: any, context: Context, outputPath?: string) => Promise<void>
    : never;
  metadata: {
    kind: T;
  };
  [key: string]: any;
}
