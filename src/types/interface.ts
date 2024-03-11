import {Context} from './manifest';

export type PluginParams = Record<string, any>;

export type PluginInterface = {
  execute: (
    inputs: PluginParams[],
    config?: Record<string, any>
  ) => PluginParams[];
  metadata: {
    kind: string;
  };
  [key: string]: any;
};

export interface ExhaustPluginInterface {
  /**
   * Execute exhaust based on `context` and `tree`, produce output to a file in `outputPath`.
   */
  execute(tree: any, context: Context, outputPath?: string): void;
}
