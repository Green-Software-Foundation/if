export const readAndParseJson = async () => {
  return {
    'mock-carbon': {
      description: 'an amount of carbon emitted into the atmosphere',
      unit: 'gCO2e',
      aggregation: 'sum',
    },
    'mock-cpu': {
      description: 'number of cores available',
      unit: 'cores',
      aggregation: 'none',
    },
  };
};
