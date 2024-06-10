export type EnvironmentOptions = {
  folderPath: string;
  install: boolean;
  dependencies: {[path: string]: string};
};

export type PathWithVersion = {[path: string]: string};
