import * as winston from 'winston';

const {combine, timestamp, printf, colorize, align} = winston.format;

/**
 * Winston logger instance.
 */
export const logger = winston.createLogger({
  format: combine(
    colorize({all: true}),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    align(),
    printf(
      (info: any) =>
        `[${info.timestamp}] ${info.stack || `${info.level}: ${info.message}`}
`
    )
  ),
  transports: [new winston.transports.Console()],
});
