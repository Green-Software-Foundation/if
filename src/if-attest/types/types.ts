export type ManifestInfo = {
  start: string;
  end: string;
  hash: string;
  if: string;
  verified: boolean;
  sci: number; // top of tree aggregate for SCI, in g/functional unit
  energy: number; // aggregated energy (value from the top level of the `tree`)
  carbon: number; // aggregated carbon (value from the top level of the `tree`)
  level: number; // 0-5 GSF review thoroughness score
  quality: number; // data quality score
  functionalUnit: string; //description of the functional unit used to calculate SCI
};
