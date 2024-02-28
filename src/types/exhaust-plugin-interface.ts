export interface ExhaustPluginInterface {
  /**
   * execute exhaust based on context and tree, produce output to a file in basePath
   */
  execute(tree: any): void;
}
