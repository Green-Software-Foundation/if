import {ModelPluginInterface} from '../types/model-interface';

export type GraphOptions = {
  'core-units': number;
  'physical-processor': string;
};

export type ImplInitializeModel = {
  config?: Record<string, any>;
  name: string;
  model?: string;
  path?: string;
};

export type InitalizedModels = {
  [key: string]: (graphOptions: GraphOptions) => Promise<ModelPluginInterface>;
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
