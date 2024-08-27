import {AggregationMethodTypes} from '@grnsft/if-core/types';

export type AggregationResult = Record<string, number>;

export const AGGREGATION_TYPES = ['horizontal', 'vertical', 'both'] as const;

export type AggregationMetric = Record<string, AggregationMethodTypes>;
