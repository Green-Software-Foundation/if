import {IOutputModelInterface} from '../interfaces';

import {CONFIG} from '../../config';

import {KeyValuePair} from '../../types/common';
import * as fs from 'fs';
import * as path from 'path';

const {MODEL_IDS} = CONFIG;
const {TDP} = MODEL_IDS;

export class TdpFinderModel implements IOutputModelInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;
  data: any;

  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  /**
   * Calculate the total emissions for a list of observations.
   *
   * Each Observation require:
   * @param {Object[]} observations
   * @param {string} observations[].timestamp RFC3339 timestamp string
   */
  async execute(observations: object | object[] | undefined): Promise<any[]> {
    if (observations === undefined) {
      throw new Error('Required Parameters not provided');
    } else if (!Array.isArray(observations)) {
      throw new Error('Observations must be an array');
    }

    return observations.map((observation: KeyValuePair) => {
      observation['thermal-design-power'] = 0;
      if ('physical-processor' in observation) {
        const physicalProcessors = observation['physical-processor'] as string;
        physicalProcessors.split(',').forEach(physicalProcessor => {
          physicalProcessor = physicalProcessor.trim();
          if (
            physicalProcessor in this.data &&
            observation['thermal-design-power'] < this.data[physicalProcessor]
          ) {
            observation['thermal-design-power'] = this.data[physicalProcessor];
          } else if (!(physicalProcessor in this.data)) {
            throw new Error(
              `physical-processor ${physicalProcessor} not found in database. Please check spelling / contribute to IEF with the data.`
            );
          }
        });
      } else {
        throw new Error('physical-processor not provided');
      }
      return observation;
    });
  }

  async configure(
    name: string,
    staticParams: object | undefined
  ): Promise<IOutputModelInterface> {
    this.staticParams = staticParams;
    this.name = name;
    this.data = await this.loadData();
    return this;
  }

  async loadData(): Promise<any> {
    const data: KeyValuePair = {};
    // read data.csv and read lines into memory
    const result = fs.readFileSync(path.join(__dirname, 'data.csv'), 'utf8');
    for (const line of result.split('\n')) {
      const [name_w_at, tdp_r] = line.split(',');
      const name = name_w_at.split('@')[0].trim();
      const tdp = parseFloat(tdp_r.replace('\r', ''));
      data[name] = tdp;
    }
    const result2 = fs.readFileSync(path.join(__dirname, 'data2.csv'), 'utf8');
    for (const line of result2.split('\n')) {
      const [name_w_at, tdp_r] = line.split(',');
      if (name_w_at === '') {
        continue;
      }
      const name = name_w_at.split('@')[0].trim();
      const tdp = parseFloat(tdp_r.replace('\r', ''));
      if (!(name in data) || data[name] < tdp) {
        data[name] = tdp;
      }
    }
    const result3 = fs.readFileSync(
      path.join(__dirname, 'boavizta_data.csv'),
      'utf8'
    );
    for (const line of result3.split('\n')) {
      const [name_w_at, tdp_r] = line.split(',');
      if (name_w_at === '') {
        continue;
      }
      const name = name_w_at.split('@')[0].trim();
      const tdp = parseFloat(tdp_r.replace('\r', ''));
      if (!(name in data) || data[name] < tdp) {
        data[name] = tdp;
      }
    }

    return data;
  }

  modelIdentifier(): string {
    return TDP;
  }
}
