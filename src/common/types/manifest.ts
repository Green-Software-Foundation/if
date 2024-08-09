import {z} from 'zod';

import {AggregationMethodTypes} from '../../if-run/types/aggregation';

import {manifestSchema} from '../util/validations';

export type Manifest = z.infer<typeof manifestSchema>;

export type GlobalPlugins = Manifest['initialize']['plugins'];

export type PluginOptions = GlobalPlugins[string];

export type AggregationParams = Manifest['aggregation'];
export type AggregationMetricsWithMethod = {
  [key: string]: AggregationMethodTypes;
};

export type AggregationParamsSure = Extract<Manifest['aggregation'], {}>;

export type Context = Omit<Manifest, 'tree'>;

export type ContextWithExec = Omit<Manifest, 'tree'>;
