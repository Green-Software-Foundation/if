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
  'global-config'?: Record<string, any>;
  method: string;
  path: string;
};

export type GlobalPlugins = {
  [key: string]: PluginOptions;
};

export type AggregationParams = {
  metrics: string[];
  type: AggregationMethodsNames;
};

export type ManifestCommon = {
  name: string;
  description: string | null | undefined;
  tags: Tags;
  params?: ManifestParameter[] | undefined | null;
  initialize: {
    plugins: GlobalPlugins;
  };
  aggregation?: AggregationParams;
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
