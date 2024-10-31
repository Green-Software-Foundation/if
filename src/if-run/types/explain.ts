import {ParameterMetadata} from '@grnsft/if-core/types';

export type ExplainParams = {
  pluginName: string;
  metadata: {inputs?: ParameterMetadata; outputs?: ParameterMetadata};
};

export type ExplainStorageType = Record<
  string,
  {
    inputs?: ParameterMetadata;
    outputs?: ParameterMetadata;
  }
>;
