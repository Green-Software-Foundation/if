/**
 * Interface for if-api process arguments.
 */
export interface IfApiArgs {
  debug: boolean;
  disableExternalPluginWarning: boolean;
  disabledPlugins?: string;
  port: string;
  host: string;
  help?: boolean;
}

export interface IfApiOptions {
  debug: boolean;
  disableExternalPluginWarning: boolean;
  disabledPlugins: string | undefined;
  port: number;
  host: string;
}
