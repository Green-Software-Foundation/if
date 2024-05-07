export interface ManifestProcessArgs {
  manifest?: string;
  output?: string;
  'override-params'?: string;
  stdout?: boolean;
}

export interface Options {
  outputPath?: string;
  stdout?: boolean;
}

export interface ProcessArgsOutputs {
  inputPath?: string;
  outputOptions: {
    outputPath?: string;
    stdout?: boolean;
  };
  paramPath?: string;
}
