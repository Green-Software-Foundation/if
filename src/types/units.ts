import {PARAMETERS} from '../config';

export type ParameterKey = keyof typeof PARAMETERS | string;

export const AGGREGATION_TYPES = ['sum', 'none', 'avg'] as const;

export type AggregationTypes = (typeof AGGREGATION_TYPES)[number];

export type Units = {
  [key: string]: Parameter;
};

export type Parameters = typeof PARAMETERS;

export type ParameterFields = {
  unit: string;
  description: string;
  aggregation: AggregationTypes;
};

export type Parameter = {
  name: string;
  unit: string;
  description: string;
  aggregation: AggregationTypes;
};
