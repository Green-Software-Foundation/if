export interface ManifestProcessArgs {
  manifest?: string;
  output?: string;
  'override-params'?: string;
  help?: boolean;
  stdout?: boolean;
}

export interface Options {
  outputPath?: string;
  stdout?: boolean;
}
