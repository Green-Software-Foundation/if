import { IOutputModelInterface } from '../interfaces';
import { KeyValuePair } from '../../types/common';

import { DefaultAzureCredential } from '@azure/identity';
import { MonitorClient } from '@azure/arm-monitor';

import * as dotenv from 'dotenv';

/**
 * Define new type to handle outputs from Azure API
 */
type AzureOutputs = {
  // add instance-type here
  timestamps: string[];
  cpu_utils: string[];
  mem_utils: string[];
};

type AzureInputs = {
  resource_group_name: string;
  vm_name: string;
  mySubscriptionId: string;
  timespan: string;
  interval: string;
  aggregation: string;
};

export class AzureImporterModel implements IOutputModelInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;
  metrics: string[] | undefined;
  vm_name: string = '';
  resource_group_name: string = '';
  subscription_id: string = '';
  timestamp = '';
  duration: number = 0;
  timespan = '';
  interval = '';
  aggregation = '';
  window = '';

  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  modelIdentifier(): string {
    return 'azure';
  }
  /**
   * Each input require:
   * @param {Object[]} inputs
   */
  async execute(inputs: object | object[] | undefined): Promise<any[]> {
    // load items from .env file
    dotenv.config();

    if (inputs === undefined) {
      throw new Error('Required Parameters not provided');
    } else if (!Array.isArray(inputs)) {
      throw new Error('inputs must be an array');
    }


    inputs.map((input: KeyValuePair) => {
      if (typeof input['azure-observation-window'] === 'string') {
        this.interval = input['azure-observation-window'];
      } else {
        throw new Error('interval is not a string');
      }
      if (typeof input['azure-observation-aggregation'] === 'string') {
        this.aggregation = input['azure-observation-aggregation'];
      } else {
        throw new Error('azure-observation-window is not a string');
      }
      if (typeof input['azure-resource-group'] === 'string') {
        this.resource_group_name = input['azure-resource-group'];
      } else {
        throw new Error('resource group is not a string');
      }
      if (typeof input['azure-vm-name'] === 'string') {
        this.vm_name = input['azure-vm-name'];
      } else {
        throw new Error('azure-vm-name is not a string');
      }
      if (typeof input['azure-subscription-id'] === 'string') {
        this.subscription_id = input['azure-subscription-id'];
      } else {
        throw new Error('azure-subscription-id is not a string');
      }
      if (typeof input['timestamp'] === 'string') {
        this.timestamp = input['timestamp'];
      } else {
        throw new Error('azure-subscription-id is not a string');
      }
      if (typeof input['duration'] === 'number') {
        this.duration = input['duration'];
      } else {
        throw new Error('duration is not a number');
      }
      if (typeof input['azure-observation-window'] === 'string') {
        this.window = input['azure-observation-window'];
      } else {
        throw new Error('observation window is not a string');
      }
    });


    this.timespan = this.getTimeSpan(this.duration, this.timestamp)
    this.interval = this.getInterval(this.window)


    const inData: AzureInputs = { resource_group_name: this.resource_group_name, vm_name: this.vm_name, mySubscriptionId: this.subscription_id, timespan: this.timespan, interval: this.interval, aggregation: this.aggregation }

    console.log(inData)
    // // Call the function and get data back in AzureOutputs object
    // const rawResults = await this.getVmUsage(inData);

    //TEMPORARY MOCK DATA FOR TESTING
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

    console.log(formattedResults);
    return formattedResults;
  }

  async getVmUsage(indata: AzureInputs): Promise<AzureOutputs> {
    const subscriptionId = indata.mySubscriptionId;
    const resourceGroupName = indata.resource_group_name;
    const vmName = indata.vm_name;
    const timespan = indata.timespan;
    const interval = indata.interval;
    const aggregation = indata.aggregation;
    const timestamps: string[] = [];
    const cpu_utils: string[] = [];
    const mem_utils: string[] = [];
    // Use DefaultAzureCredential which works with AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET environment variables.
    // You can also use other credentials provided by @azure/identity package.
    const credential = new DefaultAzureCredential();

    const monitorClient = new MonitorClient(credential, subscriptionId);

    const cpuMetricsResponse = await monitorClient.metrics.list(
      `subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Compute/virtualMachines/${vmName}`,
      {
        metricnames: 'Percentage CPU',
        timespan: timespan,
        interval: interval,
        aggregation: aggregation,
      }
    );

    for (const timeSeries of cpuMetricsResponse.value[0].timeseries || []) {
      for (const data of timeSeries.data || []) {
        try {
          timestamps.push(data.timeStamp.toString());
          if (!(typeof data.average === 'undefined')) {
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
        timespan: timespan,
        interval: interval,
        aggregation: aggregation,
      }
    );

    for (const timeSeries of ramMetricsResponse.value[0].timeseries || []) {
      for (const data of timeSeries.data || []) {
        if (!(typeof data.average === 'undefined')) {
          mem_utils.push(data.average.toString());
        }
      }
    }

    const results: AzureOutputs = {
      //add instance type here
      timestamps: timestamps,
      cpu_utils: cpu_utils,
      mem_utils: mem_utils,
    };
    return results;
  }

  async configure(
    name: string,
    staticParams: object | undefined
  ): Promise<IOutputModelInterface> {
    this.staticParams = staticParams;
    this.name = name;

    return this;
  }

  /**
   * Takes impl timestamp and duration and returns an Azure formatted `timespan` value
   * @param duration 
   * @param timestamp 
   */
  private getTimeSpan(duration: number, timestamp: string): string {
    const start = new Date(timestamp)
    const end = new Date(start.getTime() + duration * 1000).toISOString();
    const outString = start.toISOString() + "/" + end;
    return outString
  }


  /**
   * Takes granularity as e.g. "1 m", "1 hr" and translates into ISO8601
   * as expected by the azure API
   * @param window
   * @returns 
   */
  private getInterval(window: string): string {

    const splits = window.split(' ', 2)
    var num: number = parseFloat(splits[0]);
    const unit: string = splits[1];
    var stub: string = '';
    const prefix: string = 'P';

    console.log(num, unit)

    if (num % 1 === 0) {
      num = Math.floor(num)
    }

    if ((unit === 'minutes') || (unit === 'm') || (unit === 'min') || (unit === 'mins')) {
      stub = `T${num}M`
    }

    const outString = prefix + stub

    console.log("splits ", splits)
    console.log("outString", outString)
    return outString
  }

}