export interface IfRunArgs {
  manifest?: string;
  output?: string;
  'override-params'?: string;
  stdout?: boolean;
  debug?: boolean;
}

export interface ProcessArgsOutputs {
  inputPath: string;
  outputOptions: {
    outputPath?: string;
    stdout?: boolean;
  };
  paramPath?: string;
  debug?: boolean;
}

export interface Options {
  outputPath?: string;
  stdout?: boolean;
}
