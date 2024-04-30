import {z} from 'zod';

import {manifestSchema} from '../util/validations';

export type Manifest = z.infer<typeof manifestSchema>;

export type GlobalPlugins = Manifest['initialize']['plugins'];

export type PluginOptions = GlobalPlugins[string];

export type AggregationParams = Manifest['aggregation'];
export type AggregationParamsSure = Extract<Manifest['aggregation'], {}>;

export type Context = Omit<Manifest, 'tree'>;
export type ContextWithExec = Omit<Manifest, 'tree'> & {
  execution: {
    command: string;
    environment: {
      os: string;
      'os-version': string;
      'node-version': string;
      'date-time': string;
      dependencies: string[];
    };
  };
};

export type ManifestParameter = Extract<Manifest['params'], {}>[number];
