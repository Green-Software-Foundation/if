export interface ManifestProcessArgs {
  manifest?: string;
  output?: string;
  'override-params'?: string;
  help?: boolean;
}

export interface ProcessArgsOutputs {
  inputPath?: string;
  outputPath?: string;
  paramPath?: string;
}
