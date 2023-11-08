import { IOutputModelInterface } from '../interfaces';

import { CONFIG } from '../../config';

import { KeyValuePair } from '../../types/common';
import * as AWS_INSTANCES from './aws-instances.json';
import * as AZURE_INSTANCES from './azure-instances.json';

const { MODEL_IDS } = CONFIG;
const { CLOUD_INSTANCE_METADATA } = MODEL_IDS;

export class CloudInstanceMetadataModel implements IOutputModelInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;

  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  /**
   * Each input require:
   * @param {Object[]} inputs
   * @param {string} inputs[].timestamp RFC3339 timestamp string
   */
  async execute(inputs: object | object[] | undefined): Promise<any[]> {
    if (inputs === undefined) {
      throw new Error('Required Parameters not provided');
    } else if (!Array.isArray(inputs)) {
      throw new Error('inputs must be an array');
    }

    return inputs.map((input: KeyValuePair) => {
      let vendor = '';
      let instance_type = '';
      if ('cloud-vendor' in input) {
        vendor = input['cloud-vendor'];
      } else {
        throw new Error('Each input must contain a cloud-vendor key');
      }
      // if ('cloud-region' in input) {
      //   region = input['cloud-region'];
      // } else {
      //   throw new Error('Each input must contain a cloud-region key');
      // }
      if ('cloud-instance-type' in input) {
        instance_type = input['cloud-instance-type'];
      } else {
        throw new Error('Each input must contain a cloud-instance-type key');
      }
      // console.log(['aws', 'azure'].includes(vendor));
      if (!['aws', 'azure'].includes(vendor)) {
        throw new Error(
          'cloud-vendor: Only `aws`/`azure` is currently supported'
        );
      }
      if (vendor === 'aws') {
        const instance = AWS_INSTANCES.find(
          instance => instance['Instance type'] === instance_type
        );
        if (instance) {
          input['vcpus-allocated'] = instance['Instance vCPU'];
          input['vcpus-total'] = instance['Platform Total Number of vCPU'];
          input['memory-available'] = instance['Instance Memory (in GB)'];
          const cpuType = instance['Platform CPU Name'];
          let platform = '';
          if (cpuType.startsWith('EPYC')) {
            platform = 'AMD';
          } else if (cpuType.startsWith('Xeon')) {
            platform = 'Intel';
          } else if (cpuType.startsWith('Graviton')) {
            platform = 'AWS';
          } else if (cpuType.startsWith('Core')) {
            platform = 'Intel';
          }
          input['physical-processor'] = `${platform} ${cpuType}`;
        } else {
          throw new Error(
            `cloud-instance-type: ${instance_type} is not supported in vendor: ${vendor}`
          );
        }
      } else if (vendor === 'azure') {
        const instance = AZURE_INSTANCES.find(
          instance => instance['instance-type'] === instance_type
        );
        if (instance) {
          input['vcpus-allocated'] = instance['cpu-cores-utilized'];
          input['vcpus-total'] = instance['cpu-cores-available'];
          input['physical-processor'] = instance['cpu-model-name'];
          input['memory-available'] = instance['memory-available'];
          input['thermal-design-power'] = instance['thermal-design-power'];
        } else {
          throw new Error(
            `cloud-instance-type: ${instance_type} is not supported in vendor: ${vendor}`
          );
        }
      }
      return input;
    });
  }

  async configure(
    name: string,
    staticParams: object | undefined
  ): Promise<IOutputModelInterface> {
    this.staticParams = staticParams;
    this.name = name;
    return this;
  }

  modelIdentifier(): string {
    return CLOUD_INSTANCE_METADATA;
  }
}
