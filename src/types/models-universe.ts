import {IImpactModelInterface} from '../lib';

type InitializeOptions = {
  allocation: string;
  verbose: boolean;
};

export type GraphOptions = {
  'core-units': number;
  processor: string;
};

export type ImplInitializeModel = {
  config: InitializeOptions;
  name: string;
  kind: 'builtin' | 'plugin' | 'shell';
};

export type InitalizedModels = {
  [key: string]: (graphOptions: GraphOptions) => Promise<IImpactModelInterface>;
};
