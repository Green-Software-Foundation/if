enum LogLevel {
  Info = 'INFO',
  Warn = 'WARN',
  Error = 'ERROR',
  Debug = 'DEBUG',
}
let plugin: string | undefined = undefined;

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
 * Sets the name of the currently executing plugin.
 */
const getExecutingPluginName = (pluginName: string) => {
  plugin = pluginName;
};

/**
 * Removes the name of the executed plugin.
 */
const removeExecutedPluginName = () => {
  plugin = undefined;
};

/**
 * Logs messages with the specified log level and format.
 */
const debugLog = (level: LogLevel, args: any[], debugMode: boolean) => {
  const date = new Date().toISOString();
  const formattedMessage = `${level}: ${date}: ${
    plugin ? plugin + ': ' : ''
  }${args.join(', ')}`;

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
      default:
        originalConsole.info(formattedMessage);
    }
  }
};

export const debugLogger = {
  overrideConsoleMethods,
  getExecutingPluginName,
  removeExecutedPluginName,
};
