
type UnitFields = {
  description: string;
  unit: string;
  aggregation: 'sum' | 'none' | 'avg';
};

export type Units = {
  [key: string]: UnitFields;
};

export type Parameter = {
  name: string;
  unit: string;
  description: string;
  aggregation: string;
};
