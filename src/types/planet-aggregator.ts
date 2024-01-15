export type AggregationResult = Record<string, number>;

export const AggregationMethods = ['horizontal', 'vertical', 'both'] as const;

export type AggregationMethodsName = (typeof AggregationMethods)[number];
