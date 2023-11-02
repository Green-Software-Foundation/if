import {DefaultAzureCredential} from '@azure/identity';
import {MonitorClient} from '@azure/arm-monitor';
import * as dotenv from 'dotenv';
import {z} from 'zod';

import {IOutputModelInterface} from '../interfaces';
import {AzureInputs, AzureOutputs} from '../../types/azure-importer';

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

  async execute(inputs: any[]): Promise<any[]> {
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

    console.log(params);
    // Call the function and get data back in AzureOutputs object
    // const rawResults = await this.getVmUsage(inData);

    // TEMPORARY MOCK DATA FOR TESTING
    const rawResults = {
      timestamps: [
        'Wed Nov 01 2023 14:37:00 GMT+0000 (Greenwich Mean Time)',
        'Wed Nov 01 2023 14:38:00 GMT+0000 (Greenwich Mean Time)',
        'Wed Nov 01 2023 14:39:00 GMT+0000 (Greenwich Mean Time)',
      ],
      cpu_utils: ['3.09', '0.34', '0.355'],
      mem_utils: ['0', '242221056', '481296384', '470286336'],
    };

    const formattedResults = rawResults.timestamps.map((timestamp, index) => ({
      timestamp,
      'cpu-util': rawResults.cpu_utils[index],
      'mem-util': rawResults.mem_utils[index],
    }));

    return formattedResults;
  }

  /**
   * Use DefaultAzureCredential which works with AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET environment variables.
   * You can also use other credentials provided by @azure/identity package.
   */
  async getVmUsage(params: AzureInputs): Promise<AzureOutputs> {
    const {
      subscriptionId,
      resourceGroupName,
      vmName,
      timespan,
      interval,
      aggregation,
    } = params;

    const timestamps: string[] = [];
    const cpu_utils: string[] = [];
    const mem_utils: string[] = [];

    const credential = new DefaultAzureCredential();
    const monitorClient = new MonitorClient(credential, subscriptionId);

    const cpuMetricsResponse = await monitorClient.metrics.list(
      `subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Compute/virtualMachines/${vmName}`,
      {
        metricnames: 'Percentage CPU',
        timespan,
        interval,
        aggregation,
      }
    );

    for (const timeSeries of cpuMetricsResponse.value[0].timeseries || []) {
      for (const data of timeSeries.data || []) {
        try {
          timestamps.push(data.timeStamp.toString());

          if (typeof data.average !== 'undefined') {
            cpu_utils.push(data.average.toString());
          }
        } catch (error) {
          console.log('error retrieving CPU data');
        }
      }
    }

    const ramMetricsResponse = await monitorClient.metrics.list(
      `subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Compute/virtualMachines/${vmName}`,
      {
        metricnames: 'Available Memory Bytes', // TODO: we need to get memory used = total - available
        timespan,
        interval,
        aggregation,
      }
    );

    for (const timeSeries of ramMetricsResponse.value[0].timeseries || []) {
      for (const data of timeSeries.data || []) {
        if (!(typeof data.average === 'undefined')) {
          mem_utils.push(data.average.toString());
        }
      }
    }

    return {
      // add instance type here
      timestamps,
      cpu_utils,
      mem_utils,
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
    const minutes = ['minutes', 'm', 'min', 'mins'];
    const days = ['days', 'd'];
    const weeks = ['week', 'weeks', 'w', 'wk', 'wks'];
    const months = ['month', 'months', 'mth'];
    const years = ['year', 'years', 'yr', 'yrs', 'y', 'ys'];

    if (minutes.includes(unit)) {
      return `T${amountOfTime}M`;
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
}
