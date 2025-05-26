import {PluginParametersMetadata} from '@grnsft/if-core/types';

export interface IFPlugin {
  path: string;
  method: string;
  config?: Record<string, any>;
  'parameter-metadata': PluginParametersMetadata;
}
