import {AggregationMetrics} from './impl';

export type PlanetAggregatorParams = {
  'aggregation-metrics': AggregationMetrics[];
};

export type AggregationResult = Record<string, number>;
