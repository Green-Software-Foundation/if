import {STRINGS} from '../config';

const {IF_CHECK_FAILED, IF_CHECK_SUMMARY_ERROR_MESSAGE} = STRINGS;

/**
 * Logs the failure message from the stdout of an error.
 */
export const logStdoutFailMessage = (error: any, fileName: string) => {
  console.log(IF_CHECK_FAILED(fileName));

  const stdout = error.stdout;
  const logs = stdout.split('\n\n');
  const failMessage = logs[logs.length - 1];

  console.log(failMessage);
  return IF_CHECK_SUMMARY_ERROR_MESSAGE(fileName, failMessage);
};
