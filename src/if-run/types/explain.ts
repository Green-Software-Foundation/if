import {ParameterMetadata} from '@grnsft/if-core/types';

import {PluginOptions} from '../../common/types/manifest';

export type ExplainParams = {
  pluginName: string;
  pluginData: PluginOptions;
  metadata: {inputs?: ParameterMetadata; outputs?: ParameterMetadata};
};
