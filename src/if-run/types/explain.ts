import {ParameterMetadata} from '@grnsft/if-core/types';

export type ExplainParams = {
  pluginName: string;
  pluginData: {method: string; path: string};
  metadata: {inputs?: ParameterMetadata; outputs?: ParameterMetadata};
};
