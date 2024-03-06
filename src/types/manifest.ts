import {z} from 'zod';

import {manifestSchema} from '../util/validations';

type Manifest = z.infer<typeof manifestSchema>;

export type GlobalPlugins = Manifest['initialize']['plugins'];

export type PluginOptions = GlobalPlugins[string];

export type AggregationParams = Manifest['aggregation'];
export type AggregationParamsSure = Extract<Manifest['aggregation'], {}>;

export type Context = Omit<Manifest, 'tree'>;

export type ManifestParameter = Extract<Manifest['params'], {}>[number];
