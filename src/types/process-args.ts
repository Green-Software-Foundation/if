export interface IEArgs {
  manifest?: string;
  output?: string;
  'override-params'?: string;
  stdout?: boolean;
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
  stdout?: boolean;
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
