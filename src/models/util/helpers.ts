import {ErrorFormatParams} from '../../types/helpers';
import {PluginName} from '../config';

/**
 * Formats given error according to class instance, scope and message.
 */
export const buildErrorMessage =
  (classInstanceName: string) => (params: ErrorFormatParams) => {
    const {scope, message} = params;

    return `${classInstanceName}${scope ? `(${scope})` : ''}: ${message}.`;
  };

/**
 * Maps an instance name to its corresponding plugin name from the PluginName object.
 */
export const mapPluginName = (instanceName: string) => PluginName[instanceName];
