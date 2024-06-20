export type EnvironmentOptions = {
  folderPath: string;
  install: boolean;
  cwd: boolean;
  dependencies: {[path: string]: string};
};
