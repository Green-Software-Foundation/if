import {AggregationOptions, ParameterMetadata} from '@grnsft/if-core/types';

import {PluginOptions} from '../../common/types/manifest';

export type ExplainParams = {
  pluginName: string;
  pluginData: PluginOptions;
  metadata: {inputs?: ParameterMetadata; outputs?: ParameterMetadata};
};

export type ExplainStorageType = Record<
  string,
  {
    plugins: string[];
    unit: string;
    description: string;
    'aggregation-method': AggregationOptions;
  }
>;
