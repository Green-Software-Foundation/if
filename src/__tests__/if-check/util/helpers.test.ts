import {logStdoutFailMessage} from '../../../if-check/util/helpers';

describe('logStdoutFailMessage(): ', () => {
  it('successfully logs the stdout failed message.', () => {
    const errorMessage = {stdout: '\n\nmock error message'};
    const mockFilename = 'mock-filename.yaml';
    const logSpy = jest.spyOn(global.console, 'log');
    logStdoutFailMessage(errorMessage, mockFilename);

    expect.assertions(2);

    expect(logSpy).toHaveBeenCalledWith(
      `✖ if-check could not verify ${mockFilename}. The re-executed file does not match the original.\n`
    );

    expect(logSpy).toHaveBeenCalledWith('mock error message');
  });

  it('successfully logs the error message.', () => {
    const error = new Error('mock error message');
    const mockFilename = 'mock-filename.yaml';
    const logSpy = jest.spyOn(global.console, 'log');
    logStdoutFailMessage(error, mockFilename);

    expect.assertions(2);

    expect(logSpy).toHaveBeenCalledWith(
      `✖ if-check could not verify ${mockFilename}. The re-executed file does not match the original.\n`
    );

    expect(logSpy).toHaveBeenCalledWith('mock error message');
  });
});
