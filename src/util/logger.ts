import * as winston from 'winston';

const {combine, printf, colorize} = winston.format;

type LoggerScopes = 'CLI' | 'Manifest' | 'Plugin';

/**
 * Setups the pattern for logging.
 */
const alignAllColors = (meta: LoggerScopes) =>
  combine(
    printf((info: any) => {
      const namePattern = info.name ? `${info.name}: ` : '';
      const stackPattern = info.stack ?? '';
      const messagePattern = `${info.message}${info.stack ? '\n' : ''}`;

      return `(${info.level})[${meta}] ${namePattern}${messagePattern}${stackPattern}\n`;
    }),
    colorize({all: true})
  );

/**
 * Winston logger instance.
 */
export const Logger = (meta: LoggerScopes) =>
  winston.createLogger({
    format: combine(alignAllColors(meta)),
    transports: [new winston.transports.Console()],
  });
