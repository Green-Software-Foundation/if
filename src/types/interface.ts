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
