import {z} from 'zod';

import {manifestSchema} from '../util/validations';

export type Manifest = z.infer<typeof manifestSchema>;

export type GlobalPlugins = Manifest['initialize']['plugins'];
export type GlobalExhaustPlugins = Manifest['initialize']['exhaustPlugins'];
export type PluginOptions = GlobalPlugins[string];
export type ExhaustPluginOptions = GlobalExhaustPlugins extends Record<
  string,
  any
>
  ? GlobalExhaustPlugins[string]
  : never; // to handle a case where Manifest['initialize']['exhaustPlugins'] does not exist, as it is optional
export type AggregationParams = Manifest['aggregation'];
export type AggregationParamsSure = Extract<Manifest['aggregation'], {}>;

export type Context = Omit<Manifest, 'tree'>;

export type ManifestParameter = Extract<Manifest['params'], {}>[number];
