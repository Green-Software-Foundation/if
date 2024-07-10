export type ManifestInfo = {
  start: string;
  end: string;
  hash: string;
  if: string;
  verified: boolean;
  sci: number;
  unit: string; // aggregated SCI (from the top level of the `tree`)aggregate
  energy: number; // aggregated energy (value from the top level of the `tree`)
  carbon: number; // aggregated carbon (value from the top level of the `tree`)
  level: number; // 0-5 GSF review thoroughness score
  quality: number; // data quality score
};
