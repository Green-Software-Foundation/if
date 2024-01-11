export type AggregationResult = Record<string, number>;

export const AggregationMethods = [
  'none',
  'horizontal',
  'vertical',
  'both',
] as const;

export type AggregationMethodsName = (typeof AggregationMethods)[number];
