const logSpy = jest.spyOn(console, 'log');
const infoSpy = jest.spyOn(console, 'info');
const warnSpy = jest.spyOn(console, 'warn');
const errorSpy = jest.spyOn(console, 'error');
const debugSpy = jest.spyOn(console, 'debug');

import {debugLogger} from '../../../common/util/debug-logger';

describe('util/debug-logger: ', () => {
  beforeEach(() => {
    debugLogger.overrideConsoleMethods(true);
  });

  afterEach(() => {
    logSpy.mockRestore();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    debugSpy.mockRestore();
  });

  afterEach(() => {
    debugLogger.setExecutingPluginName();
  });

  it('overrides console methods and log messages with INFO level.', () => {
    console.log('Starting IF');

    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('INFO:'));
  });

  it('does not override console method if the message starts with `# start`.', () => {
    console.log('# start');

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('# start'));
  });

  it('logs messages with WARN level.', () => {
    console.warn('Test warn message');

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('WARN:'));
  });

  it('logs messages with ERROR level.', () => {
    console.error('Test error message');

    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('ERROR:'));
  });

  it('logs messages with DEBUG level.', () => {
    console.debug('Test debug message');

    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('DEBUG:'));
  });

  it('includes plugin name in log messages when set.', () => {
    debugLogger.setExecutingPluginName('TestPlugin');

    console.log('Test message with plugin');

    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining('TestPlugin:')
    );
  });

  it('not includes plugin name in log messages when removed.', () => {
    debugLogger.setExecutingPluginName();

    console.log('Test message without plugin');

    expect(infoSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('TestPlugin:')
    );
  });

  it('not logs messages when debugMode is false.', () => {
    debugLogger.overrideConsoleMethods(false);
    console.log('Test message when debugMode is false');

    expect(infoSpy).not.toHaveBeenCalled();
  });

  it('drops off the log message with DEBUG level when the `debug` command is not provided.', () => {
    debugLogger.overrideConsoleMethods(false);
    console.debug('Test debug message');

    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('drops off the log message from the STRINGS when the `debug` command is not provided.', () => {
    debugLogger.overrideConsoleMethods(false);
    console.info('Starting Impact framework');

    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('logs empty messages when the message is `\n`.', () => {
    console.debug('\n');

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith();
  });

  it('logs messages when the message contains `**Computing`.', () => {
    const logMessage = '**Computing some pipline message';
    console.debug(logMessage);

    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining(logMessage));
  });

  it('logs messages when the message is a number.', () => {
    const logMessage = 10;
    console.debug(logMessage);

    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining('DEBUG:'));
    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining(logMessage.toString())
    );
  });
});
