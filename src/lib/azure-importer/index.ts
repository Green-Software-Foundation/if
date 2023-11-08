import {DefaultAzureCredential} from '@azure/identity';
import {MonitorClient} from '@azure/arm-monitor';
import {ComputeManagementClient} from '@azure/arm-compute';
import * as dotenv from 'dotenv';
import {z} from 'zod';

import {IOutputModelInterface} from '../interfaces';
import {
  AzureInputs,
  AzureOutputs,
  GetMetricsParams,
  AzureMetadataOutputs,
} from '../../types/azure-importer';

/**
 * @todo Move all input validation schemas to separate file.
 */
const azureInputSchema = z
  .object({
    'azure-observation-window': z.string(),
    'azure-observation-aggregation': z.string(),
    'azure-resource-group': z.string(),
    'azure-vm-name': z.string(),
    'azure-subscription-id': z.string(),
    timestamp: z.string().datetime(),
    duration: z.number(),
  })
  .required()
  .array();

export class AzureImporterModel implements IOutputModelInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;

  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  modelIdentifier(): string {
    return 'azure';
  }

  /**
   * Validates given `inputs` params. If it's valid, then captures params, then passes to monitor.
   * Returns flattened result from Azure monitor client.
   */
  async execute(inputs: any[]): Promise<any> {
    dotenv.config();

    azureInputSchema.parse(inputs);

    const input = inputs[0];

    const params: AzureInputs = {
      aggregation: input['azure-observation-aggregation'],
      resourceGroupName: input['azure-resource-group'],
      vmName: input['azure-vm-name'],
      subscriptionId: input['azure-subscription-id'],
      timestamp: input['timestamp'],
      duration: input['duration'],
      window: input['azure-observation-window'],
      timespan: this.getTimeSpan(input['duration'], input['timestamp']),
      interval: this.getInterval(input['azure-observation-window']),
    };

    // Call the function and get data back in AzureOutputs object
    const rawResults = await this.getVmUsage(params);
    const rawMetadataResults = await this.getInstanceMetadata(
      params.subscriptionId,
      params.vmName,
      params.resourceGroupName
    );

    const perInputDuration = this.calculateDurationPerInput(params);

    return rawResults.timestamps.map((timestamp, index) => ({
      timestamp,
      duration: perInputDuration,
      'cloud-vendor': 'azure',
      'cpu-util': rawResults.cpu_utils[index],
      'mem-availableGB': parseFloat(rawResults.memAvailable[index]) * 1e-9,
      'mem-usedGB':
        parseFloat(rawMetadataResults.totalMemoryGB) -
        parseFloat(rawResults.memAvailable[index]) * 1e-9,
      'total-memoryGB': rawMetadataResults.totalMemoryGB,
      'mem-util':
        ((parseFloat(rawMetadataResults.totalMemoryGB) -
          parseFloat(rawResults.memAvailable[index]) * 1e-9) /
          parseFloat(rawMetadataResults.totalMemoryGB)) *
        100,
      location: rawMetadataResults.location,
      'cloud-instance-type': rawMetadataResults.instanceType,
    }));
  }

  /**
   * Gets CPU metrics by calling monitor client.
   */
  private getCPUMetrics = (
    monitorClient: MonitorClient,
    params: GetMetricsParams
  ) => {
    const {
      subscriptionId,
      resourceGroupName,
      timespan,
      interval,
      aggregation,
      vmName,
    } = params;
    const metricnames = 'Percentage CPU';
    return monitorClient.metrics.list(
      `subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Compute/virtualMachines/${vmName}`,
      {
        metricnames,
        timespan,
        interval,
        aggregation,
      }
    );
  };

  /**
   * Gets RAW metrics by calling monitor client.
   */
  private getRawMetrics = (
    monitorClient: MonitorClient,
    params: GetMetricsParams
  ) => {
    const {
      subscriptionId,
      resourceGroupName,
      timespan,
      interval,
      aggregation,
      vmName,
    } = params;
    const metricnames = 'Available Memory Bytes';
    return monitorClient.metrics.list(
      `subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Compute/virtualMachines/${vmName}`,
      {
        metricnames,
        timespan,
        interval,
        aggregation,
      }
    );
  };

  /**
   * Use DefaultAzureCredential which works with AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET environment variables.
   * You can also use other credentials provided by @azure/identity package.
   */
  private async getVmUsage(params: AzureInputs): Promise<AzureOutputs> {
    const {
      subscriptionId,
      resourceGroupName,
      vmName,
      timespan,
      interval,
      aggregation,
    } = params;
    const getMetricParams = {
      subscriptionId,
      resourceGroupName,
      vmName,
      timespan,
      interval,
      aggregation,
    };

    const timestamps: string[] = [];
    const cpu_utils: string[] = [];
    const memAvailable: string[] = [];

    const credential = new DefaultAzureCredential();
    const monitorClient = new MonitorClient(credential, subscriptionId);
    const cpuMetricsResponse = await this.getCPUMetrics(
      monitorClient,
      getMetricParams
    );

    // parse CPU util data
    for (const timeSeries of cpuMetricsResponse.value[0].timeseries || []) {
      const timeSeriesData = timeSeries.data || [];
      for (const data of timeSeriesData) {
        try {
          timestamps.push(data.timeStamp.toISOString());

          if (!(data.average === undefined)) {
            cpu_utils.push(data.average.toString());
          }
        } catch (error) {
          console.log('error retrieving CPU data');
        }
      }
    }

    const ramMetricsResponse = await this.getRawMetrics(
      monitorClient,
      getMetricParams
    );

    // parse ram util data
    for (const timeSeries of ramMetricsResponse.value[0].timeseries || []) {
      for (const data of timeSeries.data || []) {
        if (!(typeof data.average === 'undefined')) {
          memAvailable.push(data.average.toString());
        }
      }
    }

    return {
      timestamps,
      cpu_utils,
      memAvailable,
    };
  }

  /**
   * Initalize static params.
   */
  async configure(
    name: string,
    staticParams: object | undefined
  ): Promise<IOutputModelInterface> {
    this.staticParams = staticParams;
    this.name = name;

    return this;
  }

  /**
   * Takes impl timestamp and duration and returns an Azure formatted `timespan` value.
   */
  private getTimeSpan(duration: number, timestamp: string): string {
    const start = new Date(timestamp);
    const end = new Date(start.getTime() + duration * 1000).toISOString();

    return `${start.toISOString()}/${end}`;
  }

  /**
   * Formats given `amountOfTime` according to given `unit`.
   * Throws error if given `unit` is not supported.
   */
  private timeUnitConverter(amountOfTime: number, unit: string) {
    const seconds = ['seconds', 'second', 'secs', 'sec', 's'];
    const minutes = ['minutes', 'm', 'min', 'mins'];
    const hours = ['hour', 'hours', 'h', 'hr', 'hrs'];
    const days = ['days', 'd'];
    const weeks = ['week', 'weeks', 'w', 'wk', 'wks'];
    const months = ['month', 'months', 'mth'];
    const years = ['year', 'years', 'yr', 'yrs', 'y', 'ys'];

    if (seconds.includes(unit)) {
      throw new Error('The minimum unit of time for azure importer is minutes');
    }

    if (minutes.includes(unit)) {
      return `T${amountOfTime}M`;
    }

    if (hours.includes(unit)) {
      return `T${amountOfTime}H`;
    }

    if (days.includes(unit)) {
      return `${amountOfTime}D`;
    }

    if (weeks.includes(unit)) {
      return `${amountOfTime}W`;
    }

    if (months.includes(unit)) {
      return `${amountOfTime}M`;
    }

    if (years.includes(unit)) {
      return `${amountOfTime}Y`;
    }

    throw new Error('azure-observation-window parameter is malformed');
  }

  /**
   * Takes granularity as e.g. "1 m", "1 hr" and translates into ISO8601 as expected by the azure API.
   */
  private getInterval(window: string): string {
    const splits = window.split(' ', 2);
    const floatNumber: number = parseFloat(splits[0]);
    // if number is a whole number, cast as int to avoid the ".0"
    const amountOfTime =
      floatNumber % 1 === 0 ? Math.floor(floatNumber) : floatNumber;
    const unit: string = splits[1];
    const numberInFormat = this.timeUnitConverter(amountOfTime, unit);

    return `P${numberInFormat}`;
  }

  /**
   * Caculates total memory based on data from ComputeManagementClient response.
   */
  private async calculateTotalMemory(params: any) {
    const {client, instanceType, location} = params;
    // here we grab the total memory for the instance
    const memResponseData = [];

    for await (const item of client.resourceSkus.list()) {
      memResponseData.push(item);
    }

    let totalMemoryGB = '';
    const filteredMemData = memResponseData
      .filter(item => item.resourceType === 'virtualMachines')
      .filter(item => item.name === instanceType)
      .filter(item => item.locations !== undefined);

    const vmCapabilitiesData = filteredMemData
      .filter(
        item => item.locations !== undefined && item.locations[0] === location
      )
      .map(item => item.capabilities)[0];

    if (vmCapabilitiesData !== undefined) {
      const totalMemoryObject = vmCapabilitiesData.filter(
        (item: any) => item.name === 'MemoryGB'
      )[0];
      if (totalMemoryObject.value !== undefined) {
        totalMemoryGB = totalMemoryObject.value;
      }
    }

    return totalMemoryGB;
  }

  /**
   * Gathers instance metadata.
   */
  private async getInstanceMetadata(
    subscriptionId: string,
    vmName: string,
    resourceGroupName: string
  ): Promise<AzureMetadataOutputs> {
    const credential = new DefaultAzureCredential();
    const client = new ComputeManagementClient(credential, subscriptionId);

    const vmData = [];
    for await (const item of client.virtualMachines.list(resourceGroupName)) {
      vmData.push(item);
    }

    const filteredVmData = vmData.filter(item => item.name === vmName);
    const location = filteredVmData.map(item => item.location ?? 'unknown')[0];
    const instanceType = filteredVmData.map(
      item => item.hardwareProfile?.vmSize ?? 'unknown'
    )[0];

    const totalMemoryGB = await this.calculateTotalMemory({
      client,
      instanceType,
      location,
    });

    return {
      location,
      instanceType,
      totalMemoryGB,
    };
  }

  /**
   * Calculates number of seconds covered by each individual input using azure-time-window value
   */
  private calculateDurationPerInput(params: AzureInputs): number {
    const window = params.window;
    const splits = window.split(' ', 2);
    const floatNumber = parseFloat(splits[0]);
    const unit = splits[1];
    let duration = 0;

    const seconds = ['seconds', 'second', 'secs', 'sec', 's'];
    const minutes = ['minutes', 'm', 'min', 'mins'];
    const hours = ['hour', 'hours', 'h', 'hr', 'hrs'];
    const days = ['days', 'd'];
    const weeks = ['week', 'weeks', 'w', 'wk', 'wks'];
    const months = ['month', 'months', 'mth'];
    const years = ['year', 'years', 'yr', 'yrs', 'y', 'ys'];

    if (seconds.includes(unit)) {
      const secs_per_unit = 1;
      duration = secs_per_unit * floatNumber;
    }
    if (minutes.includes(unit)) {
      const secs_per_unit = 60;
      duration = secs_per_unit * floatNumber;
    }
    if (hours.includes(unit)) {
      const secs_per_unit = 3600;
      duration = secs_per_unit * floatNumber;
    }
    if (days.includes(unit)) {
      const secs_per_unit = 86400;
      duration = secs_per_unit * floatNumber;
    }
    if (weeks.includes(unit)) {
      const secs_per_unit = 604800;
      duration = secs_per_unit * floatNumber;
    }
    if (months.includes(unit)) {
      const secs_per_unit = 2419200;
      duration = secs_per_unit * floatNumber;
    }
    if (years.includes(unit)) {
      const secs_per_unit = 29030400;
      duration = secs_per_unit * floatNumber;
    }

    return duration;
  }
}
