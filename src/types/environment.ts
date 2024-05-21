export type PackageDependency = {
  version: string;
  resolved?: string;
  overridden: boolean;
  extraneous?: boolean;
};

type PackageProblem = {
  extraneous: string;
};

export type NpmListResponse = {
  version: string;
  name: string;
  problems?: PackageProblem[];
  dependencies: {
    [key: string]: PackageDependency;
  };
};
