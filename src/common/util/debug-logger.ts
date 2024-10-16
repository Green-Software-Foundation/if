import {STRINGS} from '../../if-run/config';

const logMessagesKeys: (keyof typeof STRINGS)[] = [
  'STARTING_IF',
  'EXITING_IF',
  'LOADING_MANIFEST',
  'VALIDATING_MANIFEST',
  'CAPTURING_RUNTIME_ENVIRONMENT_DATA',
  'CHECKING_AGGREGATION_METHOD',
  'INITIALIZING_PLUGINS',
  'INITIALIZING_PLUGIN',
  'LOADING_PLUGIN_FROM_PATH',
  'COMPUTING_PIPELINE_FOR_NODE',
  'COMPUTING_COMPONENT_PIPELINE',
  'REGROUPING',
  'OBSERVING',
  'MERGING_DEFAULTS_WITH_INPUT_DATA',
  'AGGREGATING_OUTPUTS',
  'AGGREGATING_NODE',
  'PREPARING_OUTPUT_DATA',
  'EXPORTING_TO_YAML_FILE',
];

enum LogLevel {
  Info = 'INFO',
  Warn = 'WARN',
  Error = 'ERROR',
  Debug = 'DEBUG',
}

const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
};

/**
 * Overrides console methods with custom debug logging.
 */
const overrideConsoleMethods = (debugMode: boolean) => {
  console.log = (...args: any[]) => debugLog(LogLevel.Info, args, debugMode);
  console.info = (...args: any[]) => debugLog(LogLevel.Info, args, debugMode);
  console.warn = (...args: any[]) => debugLog(LogLevel.Warn, args, debugMode);
  console.error = (...args: any[]) => debugLog(LogLevel.Error, args, debugMode);
  console.debug = (...args: any[]) => debugLog(LogLevel.Debug, args, debugMode);
};

/**
 * Creates an encapsulated object to retrieve the plugin name.
 */
const pluginNameManager = (() => {
  let pluginName: string | undefined = '';

  const manager = {
    get currentPluginName() {
      return pluginName;
    },
    set currentPluginName(value: string | undefined) {
      pluginName = value;
    },
  };

  return manager;
})();

/**
 * Sets the name of the currently executing plugin.
 */
const setExecutingPluginName = (pluginName?: string) => {
  pluginNameManager.currentPluginName = pluginName;
};

/**
 * Logs messages with the specified log level and format.
 */
const debugLog = (level: LogLevel, args: any[], debugMode: boolean) => {
  if (!debugMode) {
    if (level === LogLevel.Debug) {
      return;
    }

    const isDebugLog =
      typeof args[0] === 'string' &&
      logMessagesKeys.some(key => {
        const message =
          typeof STRINGS[key] === 'function'
            ? (STRINGS[key] as Function).call(null, '')
            : (STRINGS[key] as string);

        return args[0].includes(message);
      });

    if (!isDebugLog) {
      originalConsole.log(...args);
    }

    return;
  }

  if (typeof args[0] === 'string' && args[0].includes('# start')) {
    originalConsole.log(...args);
    return;
  }

  if (args[0] === '\n') {
    originalConsole.log();
    return;
  }

  const date = new Date().toISOString();
  const plugin = pluginNameManager.currentPluginName;
  const isExeption =
    typeof args[0] === 'string' && args[0].includes('**Computing');
  const message = `${level}: ${date}: ${plugin ? plugin + ': ' : ''}${args.join(
    ', '
  )}`;

  const formattedMessage = isExeption ? args.join(', ') : message;

  if (debugMode) {
    switch (level) {
      case LogLevel.Info:
        originalConsole.info(formattedMessage);
        break;
      case LogLevel.Warn:
        originalConsole.warn(formattedMessage);
        break;
      case LogLevel.Error:
        originalConsole.error(formattedMessage);
        break;
      case LogLevel.Debug:
        originalConsole.debug(formattedMessage);
        break;
    }
  }
};

export const debugLogger = {
  overrideConsoleMethods,
  setExecutingPluginName,
};
