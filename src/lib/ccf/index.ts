import {INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING} from '@cloud-carbon-footprint/aws/dist/lib/AWSInstanceTypes';
import {IImpactModelInterface} from '../interfaces';
import Spline from 'typescript-cubic-spline';
import * as aws_instances from './aws-instances.json';
import * as gcp_instances from './gcp-instances.json';
import * as gcp_use from './gcp-use.json';
import * as aws_use from './aws-use.json';
import * as azure_use from './azure-use.json';
import * as azure_instances from './azure-instances.json';
import * as gcp_embodied from './gcp-embodied.json';
import * as aws_embodied from './aws-embodied.json';
import * as azure_embodied from './azure-embodied.json';
import {KeyValuePair} from '../../types/boavizta';

// consumption information for a single instance
interface IConsumption {
  idle?: number;
  tenPercent?: number;
  fiftyPercent?: number;
  hundredPercent?: number;
  minWatts?: number;
  maxWatts?: number;
}

// information about a single compute instance
interface IComputeInstance {
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
  e: number;
  m: number;
}

export class CloudCarbonFootprint implements IImpactModelInterface {
  // Defined for compatibility. Not used in CCF.
  authParams: object | undefined;
  // name of the data source
  name: string | undefined;
  // compute instances grouped by the provider with usage data
  private computeInstances: {[key: string]: {[key: string]: IComputeInstance}} =
    {};

  // list of all the compute instances by Architecture
  private gcpList: KeyValuePair = {};
  private azureList: KeyValuePair = {};
  private awsList: KeyValuePair = {};

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
   *  Parameters:
   *   name: name of the resource
   *  Configuration Parameters for StaticParams
   *
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
   *  @param {number} observations[].cpu: cpu usage in percentage
   */
  async calculate(
    observations: object | object[] | undefined
  ): Promise<object> {
    if (observations === undefined) {
      throw new Error('Required Parameters not provided');
    }

    if (this.instanceType === '' || this.provider === '') {
      throw new Error('Configuration is incomplete');
    }

    const results: ICcfResult[] = [];
    if (Array.isArray(observations)) {
      observations.forEach((observation: KeyValuePair) => {
        const e = this.calculateEnergy(observation);
        const m = this.embodiedEmissions(observation);

        results.push({
          e: e,
          m: m,
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
   * cpu: cpu usage in percentage
   * datetime: ISO 8601 datetime string
   *
   * Uses a spline method for AWS and linear interpolation for GCP and Azure
   */
  private calculateEnergy(observation: KeyValuePair) {
    if (
      !('duration' in observation) ||
      !('cpu' in observation) ||
      !('datetime' in observation)
    ) {
      throw new Error(
        'Required Parameters duration,cpu,datetime not provided for observation'
      );
    }

    //    duration is in seconds
    const duration = observation['duration'];

    //    convert cpu usage to percentage
    const cpu = observation['cpu'] * 100.0;

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
    return 'ccf.cloud.sci';
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
    let gcpMin = 0.0;
    let gcpMax = 0.0;
    let gcpCount = 0;
    // standardize gcp emissions
    // gcp_use loaded from coefficients-gcp-use.csv file from CCF
    gcp_use.forEach((instance: KeyValuePair) => {
      this.gcpList[instance['Architecture']] = instance;
      gcpMin += parseFloat(instance['Min Watts']);
      gcpMax += parseFloat(instance['Max Watts']);
      gcpCount += 1;
    });
    const gcpAvgMin = gcpMin / gcpCount;
    const gcpAvgMax = gcpMax / gcpCount;
    this.gcpList['Average'] = {
      'Min Watts': gcpAvgMin,
      'Max Watts': gcpAvgMax,
      Architecture: 'Average',
    };
    let azureMin = 0.0;
    let azureMax = 0.0;
    let azureCount = 0;
    // azure_use loaded from coefficients-azure-use.csv file from CCF
    azure_use.forEach((instance: KeyValuePair) => {
      this.azureList[instance['Architecture']] = instance;
      azureMin += parseFloat(instance['Min Watts']);
      azureMax += parseFloat(instance['Max Watts']);
      azureCount += 1;
    });
    const azureAvgMin = azureMin / azureCount;
    const azureAvgMax = azureMax / azureCount;
    this.azureList['Average'] = {
      'Min Watts': azureAvgMin,
      'Max Watts': azureAvgMax,
      Architecture: 'Average',
    };
    let awsMin = 0.0;
    let awsMax = 0.0;
    let awsCount = 0;
    // aws_use loaded from coefficients-aws-use.csv file from CCF
    aws_use.forEach((instance: KeyValuePair) => {
      this.awsList[instance['Architecture']] = instance;
      awsMin += parseFloat(instance['Min Watts']);
      awsMax += parseFloat(instance['Max Watts']);
      awsCount += 1;
    });
    const awsAvgMin = awsMin / awsCount;
    const awsAvgMax = awsMax / awsCount;
    this.awsList['Average'] = {
      'Min Watts': awsAvgMin,
      'Max Watts': awsAvgMax,
      Architecture: 'Average',
    };
    aws_instances.forEach((instance: KeyValuePair) => {
      const cpus = parseInt(instance['Instance vCPU'], 10);
      const architectures = INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[
        instance['Instance type']
      ] ?? ['Average'];
      let minWatts = 0.0;
      let maxWatts = 0.0;
      let count = 0;
      architectures.forEach((architecture: string) => {
        architecture = this.resolveAwsArchitecture(architecture);
        minWatts += this.awsList[architecture]['Min Watts'] ?? 0;
        maxWatts += this.awsList[architecture]['Max Watts'] ?? 0;
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
          minWatts: minWatts,
          maxWatts: maxWatts,
        },
        vCPUs: cpus,
        maxvCPUs: parseInt(instance['Platform Total Number of vCPU'], 10),
        name: instance['Instance type'],
      } as IComputeInstance;
    });
    gcp_instances.forEach((instance: KeyValuePair) => {
      const cpus = parseInt(instance['Instance vCPUs'], 10);
      let architecture = instance['Microarchitecture'];
      if (!(architecture in this.azureList)) {
        architecture = 'Average';
      }
      this.computeInstances['gcp'][instance['Machine type']] = {
        name: instance['Machine type'],
        vCPUs: cpus,
        consumption: {
          minWatts: this.gcpList[architecture]['Min Watts'] * cpus,
          maxWatts: this.gcpList[architecture]['Max Watts'] * cpus,
        },
        maxvCPUs: parseInt(
          instance['Platform vCPUs (highest vCPU possible)'],
          10
        ),
      } as IComputeInstance;
    });
    azure_instances.forEach((instance: KeyValuePair) => {
      const cpus = parseInt(instance['Instance vCPUs'], 10);
      let architecture = instance['Microarchitecture'];
      if (!(architecture in this.azureList)) {
        architecture = 'Average';
      }
      this.computeInstances['azure'][instance['Virtual Machine']] = {
        consumption: {
          minWatts: this.azureList[architecture]['Min Watts'] * cpus,
          maxWatts: this.azureList[architecture]['Max Watts'] * cpus,
        },
        name: instance['Virtual Machine'],
        vCPUs: instance['Instance vCPUs'],
        maxvCPUs: parseInt(
          instance['Platform vCPUs (highest vCPU possible)'],
          10
        ),
      } as IComputeInstance;
    });
    aws_embodied.forEach((instance: KeyValuePair) => {
      this.computeInstances['aws'][instance['type']].embodiedEmission =
        instance['total'];
    });
    gcp_embodied.forEach((instance: KeyValuePair) => {
      this.computeInstances['gcp'][instance['type']].embodiedEmission =
        instance['total'];
    });
    azure_embodied.forEach((instance: KeyValuePair) => {
      this.computeInstances['azure'][instance['type']].embodiedEmission =
        instance['total'];
    });
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

    if (!(architecture in this.awsList)) {
      console.log('ARCHITECTURE:', architecture);
    }

    return architecture;
  }

  /**
   * Calculates the embodied emissions for a given observation
   */
  private embodiedEmissions(observation: KeyValuePair): number {
    // duration
    const duration_in_hours = observation['duration'] / 3600;
    // M = TE * (TR/EL) * (RR/TR)
    // Where:
    // TE = Total Embodied Emissions, the sum of Life Cycle Assessment(LCA) emissions for all hardware components
    // TR = Time Reserved, the length of time the hardware is reserved for use by the software
    // EL = Expected Lifespan, the anticipated time that the equipment will be installed
    // RR = Resources Reserved, the number of resources reserved for use by the software.
    // TR = Total Resources, the total number of resources available.
    const TotalEmissions =
      this.computeInstances[this.provider][this.instanceType]
        .embodiedEmission ?? 0;
    const TimeReserved = duration_in_hours;
    const ExpectedLifespan = 8760 * this.expectedLifespan;
    const ReservedResources =
      this.computeInstances[this.provider][this.instanceType].vCPUs ?? 1.0;
    const TotalResources =
      this.computeInstances[this.provider][this.instanceType].maxVCPUs ?? 1.0;

    return (
      TotalEmissions *
      (TimeReserved / ExpectedLifespan) *
      (ReservedResources / TotalResources)
    );
  }
}
