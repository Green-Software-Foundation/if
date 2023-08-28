interface Observation {
  timestamp: string;
  duration: number;
  cpu: number;
}

interface Config {
  sku: string;
}

interface Series {
  observations: Observation[];
}

interface Queue {
  config: Config;
  series: Series;
}

interface ServerParams {
  vendor: string;
  region: string;
}

interface Servers {
  config: Config;
  params: ServerParams;
  observations: Observation;
}

interface LoadBalancer {
  model: string;
  config: Config;
  observation: Observation;
}

interface Backend {
  model: string;
  config: Config;
  children: {
    servers?: Servers;
    queue?: Queue;
  };
}

interface Edge {
  'load-balancer': LoadBalancer;
}

interface Graph {
  backend: Backend;
  edge: Edge;
}

interface Pipeline {
  plugin: string;
}

interface EnrichmentPipeline extends Pipeline {
  grid_emissions_plugin: string;
}

interface NormalizationPipeline extends Pipeline {
  impact_window: number;
}

interface AggregationPipeline extends Pipeline {
  functional_unit: string;
}

export interface ImpactYaml {
  name: string;
  description: string;
  tags: Record<string, string>;
  config: Config;
  enrichment: EnrichmentPipeline;
  normalization: NormalizationPipeline;
  aggregation: AggregationPipeline;
  graph: Graph;
}
