export type AggregationResult = Record<string, number>;

export const AGGREGATION_METHODS = ['horizontal', 'vertical', 'both'] as const;

export type AggregationMethodsNames = (typeof AGGREGATION_METHODS)[number];
