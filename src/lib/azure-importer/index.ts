import {IOutputModelInterface} from '../interfaces';

import {KeyValuePair} from '../../types/common';

import {DefaultAzureCredential} from '@azure/identity';
import {MonitorClient} from '@azure/arm-monitor';

import * as dotenv from 'dotenv';

export class AzureImporterModel implements IOutputModelInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;
  metrics: string[] | undefined;
  timespan: string | undefined;
  interval: string | undefined;
  aggregation: string | undefined;

  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  modelIdentifier(): string {
    return 'azure';
  }
  /* Each Observation require:
   * @param {Object[]} observations
   */
  async execute(inputs: object | object[] | undefined): Promise<any[]> {
    dotenv.config();

    if (inputs === undefined) {
      throw new Error('Required Parameters not provided');
    } else if (!Array.isArray(inputs)) {
      throw new Error('inputs must be an array');
    }

    //Grab Azure Model Config params from dotenv
    const mySubscriptionId: string | undefined = process.env.SUBSCRIPTION_ID;
    const myRG: string | undefined = process.env.RESOURCE_GROUP_NAME;
    const myVM: string | undefined = process.env.VM_NAME;

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
      this.metrics = input['metrics'];
      this.timespan = input['timespan'];
      this.interval = input['interval'];
      this.aggregation = input['aggregation'];
    });

    // call Azure API

    //Call the function
    this.getVmUsage(myRG, myVM, mySubscriptionId).catch(err => {
      console.error('An error occurred:', err);
    });

    //some temporary junk to satisfy return expectation

    const results = [];
    results.push('dummy');
    return results;
  }

  async getVmUsage(myRG: string, myVM: string, mySubscriptionId: string) {
    const subscriptionId = mySubscriptionId;
    const resourceGroupName = myRG;
    const vmName = myVM;

    // Use DefaultAzureCredential which works with AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET environment variables.
    // You can also use other credentials provided by @azure/identity package.
    const credential = new DefaultAzureCredential();

    const monitorClient = new MonitorClient(credential, subscriptionId);

    const cpuMetricsResponse = await monitorClient.metrics.list(
      `subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Compute/virtualMachines/${vmName}`,
      {
        metricnames: 'Percentage CPU',
        timespan: 'PT1H', // last one hour
        interval: 'PT1M', // granularity of one minute
        aggregation: 'Average',
      }
    );

    console.log('CPU Usage:');
    for (const timeSeries of cpuMetricsResponse.value[0].timeseries || []) {
      for (const data of timeSeries.data || []) {
        console.log(`Time: ${data.timeStamp}, CPU usage: ${data.average}`);
      }
    }

    const ramMetricsResponse = await monitorClient.metrics.list(
      `subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Compute/virtualMachines/${vmName}`,
      {
        metricnames: 'Available Memory Bytes', // TODO: we need to get memory used = total - available
        timespan: 'PT1H', // last one hour
        interval: 'PT1M', // granularity of one minute
        aggregation: 'Average',
      }
    );

    console.log('RAM Usage:');
    for (const timeSeries of ramMetricsResponse.value[0].timeseries || []) {
      for (const data of timeSeries.data || []) {
        console.log(`Time: ${data.timeStamp}, RAM usage: ${data.average}`);
      }
    }
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
