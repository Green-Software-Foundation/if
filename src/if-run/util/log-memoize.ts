import {LeveledLogMethod} from 'winston';

/**
 * Keeps in memory logged messages. If called with redundant message, skips logging.
 */
const memoizedLogger = () => {
  const memory: string[] = [];

  return (logger: LeveledLogMethod | typeof console.debug, message: string) => {
    if (memory.includes(message)) {
      return;
    }

    memory.push(message);
    logger(message);
  };
};

/** Singleton pattern. */
export const memoizedLog = memoizedLogger();
