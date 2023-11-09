import {IOutputModelInterface} from '../lib';

type InitializeOptions = {
  allocation: string;
  verbose: boolean;
};

export type GraphOptions = {
  'core-units': number;
  'physical-processor': string;
};

export type ModelKind = 'plugin' | 'shell';

export type ImplInitializeModel = {
  config: InitializeOptions;
  name: string;
  kind: ModelKind;
  model?: string;
  path?: string;
};

export type InitalizedModels = {
  [key: string]: (graphOptions: GraphOptions) => Promise<IOutputModelInterface>;
};

export type HandModelParams = {
  name: string;
  kind: ModelKind;
  model?: string;
  path?: string;
};
