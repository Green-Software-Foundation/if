import {AggregationMethod, AggregationMetrics} from './impl';

export type PlanetAggregatorParams = {
  'aggregation-metrics': AggregationMetrics[];
  'aggregation-method': AggregationMethod;
};

export type AggregationResult = Record<string, number>;
