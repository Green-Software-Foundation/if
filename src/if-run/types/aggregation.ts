export type AggregationResult = Record<string, number>;

export const AGGREGATION_TYPES = [
  'horizontal',
  'time',
  'vertical',
  'component',
  'both',
] as const;
