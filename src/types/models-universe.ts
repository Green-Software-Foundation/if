import {ModelPluginInterface} from '../types/model-interface';

export type ModelOptions = Record<string, any>;

export type ImplInitializeModel = {
  config?: Record<string, any>;
  name: string;
  model?: string;
  path?: string;
};

export type InitalizedModels = {
  [key: string]: (modelOptions: ModelOptions) => Promise<ModelPluginInterface>;
};

export type HandModelParams = {
  name: string;
  model?: string;
  path?: string;
};

export type ClassContainerParams = {
  model: string;
  path: string;
};
