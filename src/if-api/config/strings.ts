/**
 * Strings for if-api.
 */
export const STRINGS = {
  SERVER_STARTED: (addr: string) => `Server started on ${addr}`,
  SERVER_START_FAILED: (err: Error) => `Failed to start server: ${err}`,
  PROCESSING_REQUEST: 'Processing request',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  INVALID_JSON: 'Invalid JSON format',
  INVALID_YAML: 'Invalid YAML format',
  MISSING_MANIFEST: 'Missing manifest in request body',
  UNSUPPORTED_CONTENT_TYPE:
    'Unsupported content type. Supported types are: application/json, application/yaml',
  DISCLAIMER_MESSAGE: 'Impact Framework API - Green Software Foundation',
  INVALID_DISABLED_PLUGINS: (line: string) =>
    `Invalid DisabledPlugins settings:${line}`,
  INVALID_PORT_NUMBER: (port: string) =>
    `Invalid port number \`${port}\`. The port number should be a number between 0 and 65535.`,
} as const;
