export const PARAMETERS = {
  carbon: {
    description: 'an amount of carbon emitted into the atmosphere',
    unit: 'gCO2e',
    aggregation: 'sum',
  },
  'core-units': {
    description: 'number of cores available',
    unit: 'cores',
    aggregation: 'none',
  },
  'cpu-util': {
    description: 'refers to CPU utilization.',
    unit: 'percentage',
    aggregation: 'avg',
  },
  'disk-io': {
    description: 'refers to GB of data written/read from disk',
    unit: 'GB',
    aggregation: 'sum',
  },
  duration: {
    description: 'refers to the duration of the input',
    unit: 'seconds',
    aggregation: 'sum',
  },
  energy: {
    description: 'amount of energy utilised by the component',
    unit: 'kWh',
    aggregation: 'sum',
  },
  'energy-cpu': {
    description: 'Energy consumed by the CPU of the component',
    unit: 'kWh',
    aggregation: 'sum',
  },
  'expected-lifespan': {
    description: 'Total Expected Lifespan of the Component in Seconds',
    unit: 'seconds',
    aggregation: 'sum',
  },
  'energy-memory': {
    description: 'Energy consumed by the Memory of the component',
    unit: 'kWh',
    aggregation: 'sum',
  },
  'embodied-carbon': {
    description: 'Embodied Emissions of the component',
    unit: 'gCO2e',
    aggregation: 'sum',
  },
  'energy-network': {
    description: 'Energy consumed by the Network of the component',
    unit: 'kWh',
    aggregation: 'sum',
  },
  'functional-unit': {
    description:
      'the name of the functional unit in which the final SCI value should be expressed, e.g. requests, users',
    unit: 'none',
    aggregation: 'sum',
  },
  'functional-unit-time': {
    description:
      'string describing the unit of time in which the final SCI calculation should be expressed, e.g. "1-min"',
    unit: 'none',
    aggregation: 'none',
  },
  'gpu-util': {
    description: 'refers to CPU utilization.',
    unit: 'percentage',
    aggregation: 'avg',
  },
  'grid-carbon-intensity': {
    description: 'Carbon intensity for the grid',
    unit: 'gCO2eq/kWh',
    aggregation: 'avg',
  },
  'instance-type': {
    description: 'Type of Cloud Instance name used in the cloud provider APIs',
    unit: 'None',
    aggregation: 'none',
  },
  location: {
    description:
      'Geographic location of provider as string (for watt-time model it is provided as latitude and longitude, comma separated, in decimal degrees)',
    unit: 'None (decimal degrees for watt-time model)',
    aggregation: 'none',
  },
  'operational-carbon': {
    description: 'Operational Emissions of the component',
    unit: 'gCO2e',
    aggregation: 'sum',
  },
  'physical-processor': {
    description: 'Name of the physical processor',
    unit: 'None',
    aggregation: 'none',
  },
  vendor: {
    description:
      'Name of the cloud service provider in the ccf model. Can be aws, gcp or azure',
    unit: 'None',
    aggregation: 'none',
  },
  'ram-alloc': {
    description: 'refers to GB of memory allocated.',
    unit: 'GB',
    aggregation: 'avg',
  },
  'ram-util': {
    description: 'refers to percentage of memory utilized.',
    unit: 'percentage',
    aggregation: 'avg',
  },
  'resources-reserved': {
    description: 'resources reserved for an application',
    unit: 'count',
    aggregation: 'none',
  },
  'thermal-design-power': {
    description: 'thermal design power for a processor',
    unit: 'kwh',
    aggregation: 'avg',
  },
  'total-embodied-emissions': {
    description: 'total embodied emissions of some component',
    unit: 'gCO2e',
    aggregation: 'sum',
  },
  timestamp: {
    description: 'refers to the time of occurrence of the input',
    unit: 'RFC3339',
    aggregation: 'none',
  },
  'time-reserved': {
    description: 'time reserved for a component',
    unit: 'seconds',
    aggregation: 'avg',
  },
  'total-resources': {
    description: 'total resources available',
    unit: 'count',
    aggregation: 'none',
  },
};
