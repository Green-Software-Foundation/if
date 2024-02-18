export interface ExhaustPluginInterface {
  /**
   * execute exhaust based on context and tree, produce output to a file in basePath
   */
  execute(
    context: any,
    tree: any,
    basePath: string
  ): Promise<[any, any, string]>;
}
