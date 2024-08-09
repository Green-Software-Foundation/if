import {Context} from '../../common/types/manifest';

export interface ExhaustPluginInterface {
  /**
   * Execute exhaust based on `context` and `tree`, produce output to a file in `outputPath`.
   */
  execute(tree: any, context: Context, outputPath?: string): void;
}
