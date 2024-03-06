import {Context} from './manifest';

export interface ExhaustPluginInterface_deleteMe {
  /**
   * Execute exhaust based on `context` and `tree`, produce output to a file in `outputPath`.
   */
  execute(tree: any, context: Context, outputPath?: string): void;
}
