export type AzureOutputs = {
  timestamps: string[];
  cpu_utils: string[];
  mem_utils: string[];
};

export type AzureInputs = {
  resourceGroupName: string;
  vmName: string;
  subscriptionId: string;
  timespan: string;
  interval: string;
  aggregation: string;
  timestamp: string;
  duration: string;
  window: string;
};

export type GetMetricsParams = {
  subscriptionId: string;
  resourceGroupName: string;
  timespan: string;
  interval: string;
  aggregation: string;
  vmName: string;
};

export type AzureMetadataOutputs = {
  location: string[];
  instanceType: string[];
};
