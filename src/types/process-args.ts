export interface IEArgs {
  manifest?: string;
  output?: string;
  'override-params'?: string;
  'no-output'?: boolean;
  debug?: boolean;
}

export interface IFDiffArgs {
  source?: string;
  target: string;
}

export interface IFEnvArgs {
  manifest?: string;
  install?: boolean;
  cwd?: boolean;
}

export interface IFCheckArgs {
  manifest?: string;
  directory?: string;
}

export interface Options {
  outputPath?: string;
  noOutput?: boolean;
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
