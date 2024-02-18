import {PluginParams} from '../types/interface';

export interface ExhaustPluginInterface {
  /**
   * execute exhaust based on context and tree, produce output to a file in basePath
   */
  execute(context: any, tree: any, basePath: string): Promise<PluginParams[]>;
}

export class ExhaustCsvExporter implements ExhaustPluginInterface {
  /**
   * Export to CSV
   */
  async execute(
    context: any,
    tree: any,
    basePath: string
  ): Promise<[any, any, string]> {
    return Promise.resolve([context, tree, basePath]);
  }
}
