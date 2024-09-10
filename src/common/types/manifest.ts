import {z} from 'zod';
import {AggregationOptions} from '@grnsft/if-core/types';

import {manifestSchema} from '../util/validations';

export type Manifest = z.infer<typeof manifestSchema>;

export type GlobalPlugins = Manifest['initialize']['plugins'];

export type PluginOptions = GlobalPlugins[string];

export type AggregationParams = Manifest['aggregation'];
export type AggregationMetricsWithMethod = {
  [key: string]: AggregationOptions;
};

export type AggregationParamsSure = Extract<Manifest['aggregation'], {}>;

export type Context = Omit<Manifest, 'tree'>;

export type ContextWithExec = Omit<Manifest, 'tree'>;
