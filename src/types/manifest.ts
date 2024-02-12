import {AggregationMethodsNames, AggregationResult} from './aggregation';
import {ManifestParameter} from './parameters';

type Tags =
  | {
      kind?: string;
      complexity?: string;
      category?: string;
    }
  | null
  | undefined;

export type PluginOptions = {
  defaults?: Record<string, any>;
  model: string;
  path: string;
};

export type GlobalPlugins = {
  [key: string]: PluginOptions;
};

export type ManifestCommon = {
  name: string;
  description: string | null | undefined;
  tags: Tags;
  params?: ManifestParameter[] | undefined | null;
  initialize: {
    plugins: GlobalPlugins;
  };
  aggregation?: {
    metrics: string[];
    type: AggregationMethodsNames;
  };
};

export type Manifest = ManifestCommon & {
  tree: {
    children: any;
  };
};

export type OutputManifest = Manifest & {
  'aggregated-outputs'?: AggregationResult;
  'if-version'?: string | null | undefined;
};
