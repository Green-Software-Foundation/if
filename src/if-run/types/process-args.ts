export interface IfRunArgs {
  manifest?: string;
  output?: string;
  'no-output'?: boolean;
  debug?: boolean;
}

export interface ProcessArgsOutputs {
  inputPath: string;
  outputOptions: {
    outputPath?: string;
    noOutput?: boolean;
  };
  paramPath?: string;
  debug?: boolean;
}

export interface Options {
  outputPath?: string;
  noOutput?: boolean;
}
