export const AGGREGATION_TYPES = ['sum', 'none', 'avg'] as const;

type AggregationTypes = (typeof AGGREGATION_TYPES)[number];

type ParameterProps = {
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

export type Parameters = Record<string, ParameterProps>;
