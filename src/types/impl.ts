import {ModelParams} from './model-interface';
import {AggregationResult} from './planet-aggregator';
import {UnitKeyName} from './units';

type Tag = {
  kind?: string;
  complexity?: string;
  category?: string;
};

type Model = {
  name: string;
  kind?: string;
  verbose?: boolean;
  path?: string;
  config?: Config;
};

export type Config = Record<string, any>;

export type Children = {
  [key: string]: {
    pipeline: string[];
    config: Config;
    inputs: ModelParams[];
    children: Children;
    outputs?: ModelParams[];
    'aggregated-outputs'?: AggregationResult;
  };
};

export type Impl = {
  name: string;
  description: string | null | undefined;
  tags: Tag | null | undefined;
  initialize: {
    models: Model[];
  };
  graph: {
    children: Children;
  };
  aggregation?: UnitKeyName[];
  'aggregated-outputs'?: AggregationResult;
};
