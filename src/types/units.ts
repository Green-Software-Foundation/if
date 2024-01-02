export const UnitKeys = [
  'carbon',
  'core-units',
  'cpu-util',
  'disk-io',
  'duration',
  'energy-cpu',
  'expected-lifespan',
  'energy-memory',
  'embodied-carbon',
  'energy',
  'energy-network',
  'expected-lifespan',
  'functional-unit',
  'functional-unit-duration',
  'functional-unit-time',
  'gpu-util',
  'grid-carbon-intensity',
  'instance-type',
  'location',
  'embodied-carbon',
  'operational-carbon',
  'physical-processor',
  'vendor',
  'ram-alloc',
  'ram-util',
  'resources-reserved',
  'thermal-design-power',
  'total-embodied-emissions',
  'timestamp',
  'time-reserved',
  'total-resources',
] as const;

type UnitFields = {
  description: string;
  unit: string;
  aggregation: 'sum' | 'none' | 'avg';
};

export type UnitKeyName = (typeof UnitKeys)[number];

export type Units = {
  [K in UnitKeyName]: UnitFields;
};
