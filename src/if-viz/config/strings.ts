export const STRINGS = {
  SERVER_STARTED: (addr: string) => `Serving files on ${addr}`,
  SERVER_START_FAILED: (err: Error) => `Failed to start server: ${err}`,
  OPENING_BROWSER: (url: string) => `Opening browser: ${url}`,
  MANIFEST_NOT_FOUND: (path: string) => `Manifest file not found: ${path}`,
  INVALID_PORT_NUMBER: (port: string) =>
    `Invalid port number \`${port}\`. The port number should be a number between 0 and 65535.`,
  STOP_MESSAGE: 'Press Ctrl+C to stop the server.',
} as const;
