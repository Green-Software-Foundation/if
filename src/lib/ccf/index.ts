import { INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING } from '@cloud-carbon-footprint/aws/dist/lib/AWSInstanceTypes';
import Spline from 'typescript-cubic-spline';

import {
  ICcfResult,
  IComputeInstance,
  IImpactModelInterface,
} from '../interfaces';

import { CONFIG } from '../../config';

import * as AWS_INSTANCES from './aws-instances.json';
import * as GCP_INSTANCES from './gcp-instances.json';
import * as AZURE_INSTANCES from './azure-instances.json';
import * as GCP_USE from './gcp-use.json';
import * as AWS_USE from './aws-use.json';
import * as AZURE_USE from './azure-use.json';
import * as GCP_EMBODIED from './gcp-embodied.json';
import * as AWS_EMBODIED from './aws-embodied.json';
import * as AZURE_EMBODIED from './azure-embodied.json';

import { KeyValuePair, Interpolation } from '../../types/common';

const { MODEL_IDS } = CONFIG;
const { CCF } = MODEL_IDS;

export class CloudCarbonFootprint implements IImpactModelInterface {
  // Defined for compatibility. Not used in CCF.
  authParams: object | undefined;
  // name of the data source
  name: string | undefined;
  // compute instances grouped by the provider with usage data
  private computeInstances: {
    [key: string]: {
      [key: string]: IComputeInstance;
    };
  } = {};

  // list of all the by Architecture
  private computeInstanceUsageByArchitecture: KeyValuePair = {
    gcp: {},
    aws: {},
    azure: {},
  };
  private provider = '';
  private instanceType = '';
  private expectedLifespan = 4;

  private interpolation = Interpolation.LINEAR;

  constructor() {
    this.standardizeInstanceMetrics();
  }

  /**
   * Defined for compatibility. Not used in CCF.
   */
  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  /**
   *  Configures the CCF Plugin for IEF
   *  @param {string} name name of the resource
   *  @param {Object} staticParams static parameters for the resource
   *  @param {("aws"|"gcp"|"azure")} staticParams.provider aws, gcp, azure
   *  @param {string} staticParams.instance_type instance type from the list of supported instances
   *  @param {number} staticParams.expected_lifespan expected lifespan of the instance in years
   *  @param {Interpolation} staticParams.interpolation linear(All Clouds), spline (only for AWS)
   */
  async configure(
    name: string,
    staticParams: object | undefined = undefined
  ): Promise<IImpactModelInterface> {
    this.name = name;

    if (staticParams === undefined) {
      throw new Error('Required Parameters not provided');
    }

    if ('provider' in staticParams) {
      const provider = staticParams?.provider as string;
      if (['aws', 'gcp', 'azure'].includes(provider)) {
        this.provider = provider;
      } else {
        throw new Error('Provider not supported');
      }
    } else {
      throw new Error('Provider not provided');
    }

    if ('instance_type' in staticParams) {
      const instanceType = staticParams?.instance_type as string;
      if (instanceType in this.computeInstances[this.provider]) {
        this.instanceType = instanceType;
      } else {
        throw new Error('Instance Type not supported');
      }
    } else {
      throw new Error('Instance Type not provided');
    }

    if ('expected_lifespan' in staticParams) {
      this.expectedLifespan = staticParams?.expected_lifespan as number;
    }

    if ('interpolation' in staticParams) {
      if (this.provider !== 'aws') {
        throw new Error('Interpolation method not supported');
      }
      const interpolation = staticParams?.interpolation as Interpolation;
      if (Object.values(Interpolation).includes(interpolation)) {
        this.interpolation = interpolation;
      } else {
        throw new Error('Interpolation method not supported');
      }
    }

    return this;
  }

  /**
   * Calculate the total emissions for a list of observations
   *
   * Each Observation require:
   *  @param {Object[]} observations  ISO 8601 datetime string
   *  @param {string} observations[].datetime ISO 8601 datetime string
   *  @param {number} observations[].duration observation duration in seconds
   *  @param {number} observations[].cpu-util percentage cpu usage
   */
  async calculate(observations: object | object[] | undefined): Promise<any[]> {
    if (observations === undefined) {
      throw new Error('Required Parameters not provided');
    }

    if (this.instanceType === '' || this.provider === '') {
      throw new Error('Configuration is incomplete');
    }

    const results: ICcfResult[] = [];
    if (Array.isArray(observations)) {
      observations.forEach((observation: KeyValuePair) => {
        const energy = this.calculateEnergy(observation);
        const embodiedEmissions = this.embodiedEmissions(observation);

        results.push({
          energy: energy,
          embodied_emissions: embodiedEmissions,
        });
      });
    }

    return results;
  }

  /**
   * Calculates the energy consumption for a single observation
   * requires
   *
   * duration: duration of the observation in seconds
   * cpu-util: cpu usage in percentage
   * datetime: ISO 8601 datetime string
   *
   * Uses a spline method for AWS and linear interpolation for GCP and Azure
   */
  private calculateEnergy(observation: KeyValuePair) {
    if (
      !('duration' in observation) ||
      !('cpu-util' in observation) ||
      !('datetime' in observation)
    ) {
      throw new Error(
        'Required Parameters duration,cpu,datetime not provided for observation'
      );
    }

    const duration = observation['duration'];
    const cpu = observation['cpu-util'];

    //  get the wattage for the instance type
    let wattage;

    if (this.provider === 'aws' && this.interpolation === 'spline') {
      const x = [0, 10, 50, 100];

      const y: number[] = [
        this.computeInstances['aws'][this.instanceType].consumption.idle ?? 0,
        this.computeInstances['aws'][this.instanceType].consumption
          .tenPercent ?? 0,
        this.computeInstances['aws'][this.instanceType].consumption
          .fiftyPercent ?? 0,
        this.computeInstances['aws'][this.instanceType].consumption
          .hundredPercent ?? 0,
      ];

      const spline = new Spline(x, y);

      wattage = spline.at(cpu);
    } else {
      const idle =
        this.computeInstances[this.provider][this.instanceType].consumption
          .minWatts ?? 0;
      const max =
        this.computeInstances[this.provider][this.instanceType].consumption
          .maxWatts ?? 0;

      // linear interpolation
      wattage = idle + (max - idle) * (cpu / 100);
    }
    //  duration is in seconds
    //  wattage is in watts
    //  eg: 30W x 300s = 9000 J
    //  1 Wh = 3600 J
    //  9000 J / 3600 = 2.5 Wh
    //  J / 3600 = Wh
    //  2.5 Wh / 1000 = 0.0025 kWh
    //  Wh / 1000 = kWh
    // (wattage * duration) / (seconds in an hour) / 1000 = kWh
    return (wattage * duration) / 3600 / 1000;
  }

  /**
   * Returns model identifier
   */
  modelIdentifier(): string {
    return CCF;
  }

  /**
   * Standardize the instance metrics for all the providers
   *
   * Maps the instance metrics to a standard format (min, max, idle, 10%, 50%, 100%) for all the providers
   */
  standardizeInstanceMetrics() {
    this.computeInstances['aws'] = {};
    this.computeInstances['gcp'] = {};
    this.computeInstances['azure'] = {};
    this.calculateAverage('gcp', GCP_USE);
    this.calculateAverage('azure', AZURE_USE);
    this.calculateAverage('aws', AWS_USE);
    AWS_INSTANCES.forEach((instance: KeyValuePair) => {
      const cpus = parseInt(instance['Instance vCPU'], 10);
      const architectures = INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[
        instance['Instance type']
      ] ?? ['Average'];
      let minWatts = 0.0;
      let maxWatts = 0.0;
      let count = 0;
      architectures.forEach((architecture: string) => {
        architecture = this.resolveAwsArchitecture(architecture);
        minWatts +=
          this.computeInstanceUsageByArchitecture['aws'][architecture][
          'Min Watts'
          ] ?? 0;
        maxWatts +=
          this.computeInstanceUsageByArchitecture['aws'][architecture][
          'Max Watts'
          ] ?? 0;
        count += 1;
      });
      minWatts = minWatts / count;
      maxWatts = maxWatts / count;
      this.computeInstances['aws'][instance['Instance type']] = {
        consumption: {
          idle: parseFloat(instance['Instance @ Idle'].replace(',', '.')),
          tenPercent: parseFloat(instance['Instance @ 10%'].replace(',', '.')),
          fiftyPercent: parseFloat(
            instance['Instance @ 50%'].replace(',', '.')
          ),
          hundredPercent: parseFloat(
            instance['Instance @ 100%'].replace(',', '.')
          ),
          minWatts: minWatts * cpus,
          maxWatts: maxWatts * cpus,
        },
        vCPUs: cpus,
        maxvCPUs: parseInt(instance['Platform Total Number of vCPU'], 10),
        name: instance['Instance type'],
      } as IComputeInstance;
    });
    GCP_INSTANCES.forEach((instance: KeyValuePair) => {
      const cpus = parseInt(instance['Instance vCPUs'], 10);
      let architecture = instance['Microarchitecture'];

      if (!(architecture in this.computeInstanceUsageByArchitecture['gcp'])) {
        architecture = 'Average';
      }
      this.computeInstances['gcp'][instance['Machine type']] = {
        name: instance['Machine type'],
        vCPUs: cpus,
        consumption: {
          minWatts:
            this.computeInstanceUsageByArchitecture['gcp'][architecture][
            'Min Watts'
            ] * cpus,
          maxWatts:
            this.computeInstanceUsageByArchitecture['gcp'][architecture][
            'Max Watts'
            ] * cpus,
        },
        maxvCPUs: parseInt(
          instance['Platform vCPUs (highest vCPU possible)'],
          10
        ),
      } as IComputeInstance;
    });
    AZURE_INSTANCES.forEach((instance: KeyValuePair) => {
      const cpus = parseInt(instance['Instance vCPUs'], 10);
      let architecture = instance['Microarchitecture'];
      if (!(architecture in this.computeInstanceUsageByArchitecture['azure'])) {
        architecture = 'Average';
      }
      this.computeInstances['azure'][instance['Virtual Machine']] = {
        consumption: {
          minWatts:
            this.computeInstanceUsageByArchitecture['azure'][architecture][
            'Min Watts'
            ] * cpus,
          maxWatts:
            this.computeInstanceUsageByArchitecture['azure'][architecture][
            'Max Watts'
            ] * cpus,
        },
        name: instance['Virtual Machine'],
        vCPUs: instance['Instance vCPUs'],
        maxvCPUs: parseInt(
          instance['Platform vCPUs (highest vCPU possible)'],
          10
        ),
      } as IComputeInstance;
    });
    AWS_EMBODIED.forEach((instance: KeyValuePair) => {
      this.computeInstances['aws'][instance['type']].embodiedEmission =
        instance['total'];
    });
    GCP_EMBODIED.forEach((instance: KeyValuePair) => {
      this.computeInstances['gcp'][instance['type']].embodiedEmission =
        instance['total'];
    });
    AZURE_EMBODIED.forEach((instance: KeyValuePair) => {
      this.computeInstances['azure'][instance['type']].embodiedEmission =
        instance['total'];
    });
  }

  private calculateAverage(provider: string, instanceList: KeyValuePair[]) {
    let min = 0.0;
    let max = 0.0;
    let count = 0.0;
    instanceList.forEach((instance: KeyValuePair) => {
      this.computeInstanceUsageByArchitecture[provider][
        instance['Architecture']
      ] = instance;
      min += parseFloat(instance['Min Watts']);
      max += parseFloat(instance['Max Watts']);
      count += 1.0;
    });
    const avgMin = min / count;
    const avgMax = max / count;
    this.computeInstanceUsageByArchitecture[provider]['Average'] = {
      'Min Watts': avgMin,
      'Max Watts': avgMax,
      Architecture: 'Average',
    };
  }

  // Architecture strings are different between Instances-Use.JSON and the bundled Typescript from CCF.
  // This function resolves the differences.
  private resolveAwsArchitecture(architecture: string) {
    if (architecture.includes('AMD ')) {
      architecture = architecture.substring(4);
    }

    if (architecture.includes('Skylake')) {
      architecture = 'Sky Lake';
    }

    if (architecture.includes('Graviton')) {
      if (architecture.includes('2')) {
        architecture = 'Graviton2';
      } else if (architecture.includes('3')) {
        architecture = 'Graviton3';
      } else {
        architecture = 'Graviton';
      }
    }

    if (architecture.includes('Unknown')) {
      architecture = 'Average';
    }

    if (!(architecture in this.computeInstanceUsageByArchitecture['aws'])) {
      console.log('ARCHITECTURE:', architecture);
    }

    return architecture;
  }

  /**
   * Calculates the embodied emissions for a given observation
   */
  private embodiedEmissions(observation: KeyValuePair): number {
    // duration
    const durationInHours = observation['duration'] / 3600;
    // M = TE * (TR/EL) * (RR/TR)
    // Where:
    // TE = Total Embodied Emissions, the sum of Life Cycle Assessment(LCA) emissions for all hardware components
    // TR = Time Reserved, the length of time the hardware is reserved for use by the software
    // EL = Expected Lifespan, the anticipated time that the equipment will be installed
    // RR = Resources Reserved, the number of resources reserved for use by the software.
    // TR = Total Resources, the total number of resources available.
    const totalEmissions =
      this.computeInstances[this.provider][this.instanceType]
        .embodiedEmission ?? 0;
    const timeReserved = durationInHours;
    const expectedLifespan = 8760 * this.expectedLifespan;
    const reservedResources =
      this.computeInstances[this.provider][this.instanceType].vCPUs ?? 1.0;
    const totalResources =
      this.computeInstances[this.provider][this.instanceType].maxVCPUs ?? 1.0;
    // Multiply totalEmissions by 1000 to convert from kgCO2e to gCO2e
    return (
      totalEmissions *
      1000 *
      (timeReserved / expectedLifespan) *
      (reservedResources / totalResources)
    );
  }
}
