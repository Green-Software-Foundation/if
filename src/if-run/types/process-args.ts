export interface IfRunArgs {
  manifest?: string;
  output?: string;
  'no-output'?: boolean;
  debug?: boolean;
  observe?: boolean;
  regroup?: boolean;
  compute?: boolean;
}

export interface ProcessArgsOutputs {
  inputPath: string;
  outputOptions: {
    outputPath?: string;
    noOutput?: boolean;
  };
  paramPath?: string;
  debug?: boolean;
  observe?: boolean;
  regroup?: boolean;
  compute?: boolean;
}

export interface Options {
  outputPath?: string;
  noOutput?: boolean;
}
