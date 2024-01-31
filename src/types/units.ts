import {PARAMETERS} from '../config';

export type ParameterKey = keyof typeof PARAMETERS | string;

export type Units = {
  [key: string]: Parameter;
};

export type Parameters = {
  [key: ParameterKey]: ParameterFields;
};

export type ParameterFields = {
  unit: string;
  description: string;
  aggregation: 'sum' | 'none' | 'avg';
};

export type Parameter = {
  name: string;
  unit: string;
  description: string;
  aggregation: 'sum' | 'none' | 'avg';
};
