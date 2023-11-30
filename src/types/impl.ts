import {CONFIG} from '../config';
import {AggregationResult} from './planet-aggregator';

const {AGGREGATION_METHODS, AGGREGATION_METRICS} = CONFIG;

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

export type ModelParams = {
  timestamp: string;
  duration: number;
  [key: string]: any;
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

export type AggregationMetrics = (typeof AGGREGATION_METRICS)[number];
export type AggregationMethod = (typeof AGGREGATION_METHODS)[number];

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
  aggregation: {
    'aggregation-metrics': AggregationMetrics[];
    'aggregation-method': AggregationMethod;
  };
  'aggregated-outputs'?: AggregationResult;
};
