export const AGGREGATION_TYPES = ['sum', 'none', 'avg'] as const;

export type AggregationTypes = (typeof AGGREGATION_TYPES)[number];

export type Parameters = {
  [key: string]: ParameterProps;
};

export type ParameterProps = {
  unit: string;
  description: string;
  aggregation: AggregationTypes;
};

export type ManifestParameter = {
  name: string;
  unit: string;
  description: string;
  aggregation: AggregationTypes;
};
