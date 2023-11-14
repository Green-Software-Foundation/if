import {ModelPluginInterface} from '../types/model-interface';

type InitializeOptions = {
  allocation: string;
  verbose: boolean;
};

export type GraphOptions = {
  'core-units': number;
  'physical-processor': string;
};

export type ImplInitializeModel = {
  config: InitializeOptions;
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
