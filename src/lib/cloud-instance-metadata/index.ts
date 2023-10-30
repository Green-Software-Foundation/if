import {IoutputModelInterface} from '../interfaces';

import {CONFIG} from '../../config';

import {KeyValuePair} from '../../types/common';
import * as AWS_INSTANCES from './aws-instances.json';

const {MODEL_IDS} = CONFIG;
const {CLOUD_INSTANCE_METADATA} = MODEL_IDS;

export class CloudInstanceMetadataModel implements IoutputModelInterface {
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
      if (vendor !== 'aws') {
        throw new Error('cloud-vendor: Only `aws` is currently supported');
      }

      const instance = AWS_INSTANCES.find(
        instance => instance['Instance type'] === instance_type
      );
      if (instance) {
        console.log(instance);
        console.log(vendor);
        input['vcpus-allocated'] = instance['Instance vCPU'];
        input['vcpus-total'] = instance['Platform Total Number of vCPU'];
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
      return input;
    });
  }

  async configure(
    name: string,
    staticParams: object | undefined
  ): Promise<IoutputModelInterface> {
    this.staticParams = staticParams;
    this.name = name;
    return this;
  }

  modelIdentifier(): string {
    return CLOUD_INSTANCE_METADATA;
  }
}
