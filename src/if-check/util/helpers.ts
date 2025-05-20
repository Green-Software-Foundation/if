import {STRINGS} from '../config';

const {IF_CHECK_FAILED, IF_CHECK_SUMMARY_ERROR_MESSAGE} = STRINGS;

/**
 * Logs the failure message from the stdout of an error.
 */
export const logStdoutFailMessage = (error: any, fileName: string) => {
  console.log(IF_CHECK_FAILED(fileName));

  const stdout = error.stdout?.toString();
  const logs = stdout ? stdout.split('\n\n') : `${error.message}\n`;
  const failMessage = Array.isArray(logs) ? logs[logs.length - 1] : logs;

  console.log(failMessage);
  return IF_CHECK_SUMMARY_ERROR_MESSAGE(fileName, failMessage);
};
