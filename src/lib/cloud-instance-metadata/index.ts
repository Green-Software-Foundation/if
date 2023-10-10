import {IImpactModelInterface} from '../interfaces';

import {CONFIG} from '../../config';

import {KeyValuePair} from '../../types/common';
import * as AWS_INSTANCES from './aws-instances.json';

const {MODEL_IDS} = CONFIG;
const {CLOUD_INSTANCE_METADATA} = MODEL_IDS;

export class CloudInstanceMetadataModel implements IImpactModelInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;

  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  /**
   * Each Observation require:
   * @param {Object[]} observations
   * @param {string} observations[].timestamp RFC3339 timestamp string
   */
  async calculate(observations: object | object[] | undefined): Promise<any[]> {
    if (observations === undefined) {
      throw new Error('Required Parameters not provided');
    } else if (!Array.isArray(observations)) {
      throw new Error('Observations must be an array');
    }

    return observations.map((observation: KeyValuePair) => {
      let vendor = '';
      let instance_type = '';
      if ('cloud-vendor' in observation) {
        vendor = observation['cloud-vendor'];
      } else {
        throw new Error('Each observation must contain a cloud-vendor key');
      }
      // if ('cloud-region' in observation) {
      //   region = observation['cloud-region'];
      // } else {
      //   throw new Error('Each observation must contain a cloud-region key');
      // }
      if ('cloud-instance-type' in observation) {
        instance_type = observation['cloud-instance-type'];
      } else {
        throw new Error(
          'Each observation must contain a cloud-instance-type key'
        );
      }

      const instance = AWS_INSTANCES.find(
        instance => instance['Instance type'] === instance_type
      );
      if (instance) {
        console.log(instance);
        console.log(vendor);
        observation['vcpus-allocated'] = instance['Instance vCPU'];
        observation['vcpus-total'] = instance['Platform Total Number of vCPU'];
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
        observation['physical-processor'] = `${platform} ${cpuType}`;
      }
      return observation;
    });
  }

  async configure(
    name: string,
    staticParams: object | undefined
  ): Promise<IImpactModelInterface> {
    this.staticParams = staticParams;
    this.name = name;
    return this;
  }

  modelIdentifier(): string {
    return CLOUD_INSTANCE_METADATA;
  }
}
