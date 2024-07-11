export type AggregationResult = Record<string, number>;

export const AGGREGATION_TYPES = ['horizontal', 'vertical', 'both'] as const;
export const AGGREGATION_METHODS = ['sum', 'avg', 'none'] as const;

export type AggregationMetric = Record<
  string,
  {method: 'sum' | 'avg' | 'none'}
>;
