export type AggregationResult = Record<string, number>;

export const AGGREGATION_TYPES = ['horizontal', 'vertical', 'both'] as const;
export const AGGREGATION_METHODS = ['sum', 'avg', 'none'] as const;

export type AggregationMethodTypes = 'sum' | 'avg' | 'none';
export type AggregationMetric = Record<string, AggregationMethodTypes>;
