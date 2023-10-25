import { IOutputModelInterface } from '../interfaces';

import { CONFIG } from '../../config';

//import { KeyValuePair } from '../../types/common';

import { DefaultAzureCredential } from "@azure/identity";
import { MonitorClient } from "@azure/arm-monitor";

import * as dotenv from "dotenv";
dotenv.config();


//Azure Model Config params
const mysubscriptionId = "0f4bda7e-1203-4f11-9a85-22653e9af4b4"
const myRG = "green"
const myVM = "test1"


async function getVmUsage() {
    const subscriptionId = mysubscriptionId;
    const resourceGroupName = myRG;
    const vmName = myVM;

  // Use DefaultAzureCredential which works with AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET environment variables.
  // You can also use other credentials provided by @azure/identity package.
  const credential = new DefaultAzureCredential();

  const monitorClient = new MonitorClient(credential, subscriptionId);

  const cpuMetricsResponse = await monitorClient.metrics.list(
    `subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Compute/virtualMachines/${vmName}`,
    {
      metricnames: "Percentage CPU",
      timespan: "PT1H", // last one hour
      interval: "PT1M", // granularity of one minute
      aggregation: "Average",
    }
  );

  console.log("CPU Usage:");
  for (const timeSeries of cpuMetricsResponse.value[0].timeseries || []) {
    for (const data of timeSeries.data || []) {
      console.log(`Time: ${data.timeStamp}, CPU usage: ${data.average}`);
    }
  }

  const ramMetricsResponse = await monitorClient.metrics.list(
    `subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Compute/virtualMachines/${vmName}`,
    {
      metricnames: "Available Memory Bytes", // TODO: we need to get memory used = total - available
      timespan: "PT1H", // last one hour
      interval: "PT1M", // granularity of one minute
      aggregation: "Average",
    }
  );

  console.log("RAM Usage:");
  for (const timeSeries of ramMetricsResponse.value[0].timeseries || []) {
    for (const data of timeSeries.data || []) {
      console.log(`Time: ${data.timeStamp}, RAM usage: ${data.average}`);
    }
  }
}

// Call the function
getVmUsage().catch((err) => {
  console.error("An error occurred:", err);
});



const { MODEL_IDS } = CONFIG;
const { AZURE_IMPORTER } = MODEL_IDS;

export class AzureImporterModel implements IImpactModelInterface {
    authParams: object | undefined = undefined;
    staticParams: object | undefined;
    name: string | undefined;

    authenticate(authParams: object): void {
        this.authParams = authParams;
    }

    /**
     * CONFIGURE NEEDS TO FIND ALL THE REQUEST PARAMS, INCL METRIC TYPE, AGGREGATION, INTERVAL
     *
     * PLAN TO ADD:
     *  AUTH() check env vars
     *  REQUEST()
     *  MARSHALL()
     *  as private functions to be called in calculate()
     *
     *  REQUEST() will have to pull some info from .env.local to authorize API request to Azure
     *  MARSHALL will have to parse json response and reorganize into yaml/observations
     */

    /**
     * Calculate the total emissions for a list of observations.
     *
     * Each Observation require:
     * @param {Object[]} observations
     */
    async calculate(observations: object | object[] | undefined): Promise<any[]> {
        if (observations === undefined) {
            throw new Error('Observatons missing: Please create an observations field in your IMPL file');
        } else if (!Array.isArray(observations)) {
            throw new Error('Observations must be an array');
        }

        // dummy data that will eventually come from API response
        var data = [{ "timeStamp": "2023-10-24T11:24:00Z", "Percentage CPU": 35 }, { "timeStamp": "2023-10-24T11:25:00Z", "Percentage CPU": 45 }];

        for (var i = 0; i < data.length; i++) {
            for (var entry of data) {
                observations.push({ 'timestamp': entry['timeStamp'] }, { 'cpu-util': entry['Percentage CPU'] })
            }
        }
        return observations

        // IN HERE RECEIVE AZURE RESPONSE DATA AND REFORMAT FOR IMPL
        // INSERT INTO IMPL AS OBSERVATIONS

    };

    // return observations.map((observation: KeyValuePair) => {
    //     if (!('grid-carbon-intensity' in observation)) {
    //         throw new Error('observation missing `grid-carbon-intensity`');
    //     }
    //     if (!('energy' in observation)) {
    //         throw new Error('observation missing `energy`');
    //     }
    //     this.configure(this.name!, observation);
    //     const grid_ci = parseFloat(observation['grid-carbon-intensity']);
    //     const energy = parseFloat(observation['energy']);
    //     observation['operational-carbon'] = grid_ci * energy;
    //     return observation;
    // });
}

    async configure(
    name: string,
    staticParams: object | undefined
): Promise < IImpactModelInterface > {
    this.staticParams = staticParams;
    this.name = name;

    return this;
}

modelIdentifier(): string {
    return AZURE_IMPORTER;
}
}
