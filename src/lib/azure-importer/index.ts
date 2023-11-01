import {IOutputModelInterface} from '../interfaces';

import {KeyValuePair} from '../../types/common';

import {DefaultAzureCredential} from '@azure/identity';
import {MonitorClient} from '@azure/arm-monitor';

import * as dotenv from 'dotenv';

/**
 * Define new type to handle outputs from Azure API
 */
type AzureOutputs = {
  timestamps: string[];
  cpu_utils: string[];
  mem_utils: string[];
};

export class AzureImporterModel implements IOutputModelInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;
  metrics: string[] | undefined;
  timespan = '';
  interval = '';
  aggregation = '';

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

    //Load Azure Model Config params from dotenv
    const mySubscriptionId: string | undefined =
      process.env.AZURE_SUBSCRIPTION_ID;
    const myRG: string | undefined = process.env.AZURE_RESOURCE_GROUP_NAME;
    const myVM: string | undefined = process.env.AZURE_VM_NAME;

    // check for valid azure credentials in .env file
    if (
      mySubscriptionId === undefined ||
      myRG === undefined ||
      myVM === undefined
    ) {
      throw new Error('Azure credentials missing from .env');
    }

    inputs.map((input: KeyValuePair) => {
      if (!('interval' in input)) {
        throw new Error('input missing `interval`');
      }
      if (!('timespan' in input)) {
        throw new Error('input missing `timespan`');
      }
      if (!('aggregation' in input)) {
        throw new Error('input missing `aggregation`');
      }
      if (typeof input['timespan'] === 'string') {
        this.timespan = input['timespan'];
      } else {
        throw new Error('timespan is not a string');
      }
      if (typeof input['aggregation'] === 'string') {
        this.aggregation = input['aggregation'];
      } else {
        throw new Error('aggregation is not a string');
      }
      if (typeof input['interval'] === 'string') {
        this.interval = input['interval'];
      } else {
        throw new Error('interval is not a string');
      }
    });

    //Call the function and get data back in AzureOutputs object
    const rawResults = await this.getVmUsage(
      myRG,
      myVM,
      mySubscriptionId,
      this.timespan,
      this.interval,
      this.aggregation
    );

    console.log('rawResults', rawResults);

    for (let i = 0; i < rawResults.timestamps.length; i++) {
      console.log(i);
    }

    // here we need to iterate over elements in each field in `rawResults: AzureOutputs` and append each value to our yaml file
    // --->

    // temporary junk return to satisfy func signature
    const junkReturn = [];
    junkReturn.push('dummy');
    return junkReturn;
  }

  async getVmUsage(
    myRG: string,
    myVM: string,
    mySubscriptionId: string,
    timespan: string,
    interval: string,
    aggregation: string
  ): Promise<AzureOutputs> {
    const subscriptionId = mySubscriptionId;
    const resourceGroupName = myRG;
    const vmName = myVM;
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
}
