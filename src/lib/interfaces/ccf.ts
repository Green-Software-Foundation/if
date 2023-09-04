// consumption information for a single instance
export interface IConsumption {
  idle?: number;
  tenPercent?: number;
  fiftyPercent?: number;
  hundredPercent?: number;
  minWatts?: number;
  maxWatts?: number;
}

// information about a single compute instance
export interface IComputeInstance {
  consumption: IConsumption;
  embodiedEmission?: number;
  name: string;
  vCPUs?: number;
  maxVCPUs?: number;
}

export enum Interpolation {
  LINEAR = 'linear',
  SPLINE = 'spline',
}

export interface ICcfResult {
  energy: number;
  embodied_emissions: number;
}
