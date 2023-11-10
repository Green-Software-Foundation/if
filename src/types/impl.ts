type Tag = {
  kind?: string;
  complexity?: string;
  category?: string;
};

type Model = {
  name: string;
  kind?: string;
  verbose?: boolean;
  path?: string;
};

export type ModelParams = {
  timestamp: number;
  duration: number;
  [key: string]: any;
};

export type Config = {
  [key: string]: any;
};

export type Children = {
  [key: string]: {
    pipeline: string[];
    config: Config;
    inputs: ModelParams[];
    children?: Children;
    outputs?: ModelParams[];
  };
};

export type Impl = {
  name: string;
  description: string | null | undefined;
  tags: Tag | null | undefined;
  initialize: {
    models: Model[];
  };
  graph: {
    children: Children;
  };
};
