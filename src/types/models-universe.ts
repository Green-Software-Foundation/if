import {ModelPluginInterface} from '../types/model-interface';

export type ModelOptions = Record<string, any>;

export type ImplInitializeModel = {
  config?: Record<string, any>;
  name: string;
  plugin?: string;
  path?: string;
};

export type InitalizedModels = {
  [key: string]: (modelOptions: ModelOptions) => Promise<ModelPluginInterface>;
};

export type HandModelParams = {
  name: string;
  plugin?: string;
  path?: string;
};

export type ClassContainerParams = {
  plugin: string;
  path: string;
};
