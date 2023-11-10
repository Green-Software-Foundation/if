import {IOutputModelInterface} from '../lib';

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
  [key: string]: (graphOptions: GraphOptions) => Promise<IOutputModelInterface>;
};

export type HandModelParams = {
  name: string;
  model?: string;
  path?: string;
};
