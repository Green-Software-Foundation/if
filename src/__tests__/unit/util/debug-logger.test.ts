const logSpy = jest.spyOn(console, 'info');
const infoSpy = jest.spyOn(console, 'info');
const warnSpy = jest.spyOn(console, 'warn');
const errorSpy = jest.spyOn(console, 'error');
const debugSpy = jest.spyOn(console, 'debug');

import {debugLogger} from '../../../util/debug-logger';

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
    debugLogger.removeExecutedPluginName();
  });

  it('overrides console methods and log messages with INFO level.', () => {
    console.log('Test log message');

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('INFO:'));
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
    debugLogger.getExecutingPluginName('TestPlugin');

    console.log('Test message with plugin');

    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining('TestPlugin:')
    );
  });

  it('not includes plugin name in log messages when removed.', () => {
    debugLogger.getExecutingPluginName('TestPlugin');
    debugLogger.removeExecutedPluginName();

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
});
