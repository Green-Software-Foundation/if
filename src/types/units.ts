import {parameters} from '../config/params';

export type ParameterKey = keyof typeof parameters;

export type Units = {
  [key: string]: Parameter | undefined;
};

export type Parameter = {
  name: string;
  unit: string;
  description: string;
  aggregation: 'sum' | 'none' | 'avg';
};
