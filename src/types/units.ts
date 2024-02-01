export const AGGREGATION_TYPES = ['sum', 'none', 'avg'] as const;

export type AggregationTypes = (typeof AGGREGATION_TYPES)[number];

export type Units = {
  [key: string]: ParameterFields;
};

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
