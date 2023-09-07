import {IImpactModelInterface} from '../interfaces';
import {KeyValuePair} from '../../types/boavizta';
import axios from 'axios';
import * as dayjs from 'dayjs';

export class WattTimeGridEmissions implements IImpactModelInterface {
  authParams: object | undefined = undefined;
  token = '';
  staticParams: object | undefined;
  name: string | undefined;
  baseUrl = 'https://api2.watttime.org/v2';

  async authenticate(authParams: object): Promise<void> {
    this.token = 'token' in authParams ? (authParams['token'] as string) : '';
    if (this.token.startsWith('ENV_')) {
      this.token = process.env[this.token.slice(4)] ?? '';
    }
    if (this.token === '') {
      let username =
        'username' in authParams ? (authParams['username'] as string) : '';
      let password =
        'password' in authParams ? (authParams['password'] as string) : '';
      if (username.startsWith('ENV_')) {
        username = process.env[username.slice(4)] ?? '';
      }
      if (password.startsWith('ENV_')) {
        password = process.env[password.slice(4)] ?? '';
      }
      if (username === '' || password === '') {
        throw new Error('Missing username or password & token');
      }
      const tokenResponse = await axios.get(this.baseUrl + '/login', {
        auth: {
          username,
          password,
        },
      });
      this.token = tokenResponse.data.token;
    }
  }

  async calculate(
    observations: object | object[] | undefined
  ): Promise<object | object[]> {
    if (!Array.isArray(observations)) {
      throw new Error('observations should be an array');
    }
    observations = await Promise.all(
      observations.map(async (observation: KeyValuePair) => {
        const result = await this.fetchData(observation);
        return result;
      })
    );

    return Promise.resolve(observations);
  }

  async fetchData(observation: KeyValuePair) {
    if (!('location' in observation)) {
      throw new Error('location is missing');
    }
    if (
      !('latitude' in observation.location) ||
      !('longitude' in observation.location)
    ) {
      throw new Error('latitude or longitude is missing');
    }
    if (!('timestamp' in observation)) {
      throw new Error('timestamp is missing');
    }
    if (!('duration' in observation)) {
      throw new Error('duration is missing');
    }
    let duration = observation.duration;
    // WattTime API only supports up to 32 days
    if (duration > 32 * 24 * 60 * 60) {
      throw new Error('duration is too long');
    }
    const params = {
      latitude: observation.location.latitude,
      longitude: observation.location.longitude,
      starttime: dayjs(observation.timestamp).format('YYYY-MM-DDTHH:mm:ssZ'),
      endtime: dayjs(observation.timestamp).add(duration, 'seconds'),
    };
    const result = await axios.get(this.baseUrl + '/data', {
      params,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    result.data.sort((a: any, b: any) => {
      return dayjs(a.point_time).unix() > dayjs(b.point_time).unix() ? 1 : -1;
    });
    // console.log(result.data.length);
    let datapoints = 0;
    let cumulative_emission = 0;
    for (const row of result.data) {
      if (row) {
        // console.log(row);
        duration -= row.frequency;
        // lbs/MWh to kg/MWh to g/kWh (kg/MWh == g/kWh as a ratio)
        const grid_emission = row.value / 0.45359237;
        // console.log('emissions raw:', row.value);
        // convert to kg/kWh by dividing by 1000. (1MWh = 1000kWh)
        // convert to g/kWh by multiplying by 1000. (1kg = 1000g)
        // hence each other cancel out and g/kWh is the same as kg/MWh
        cumulative_emission += grid_emission;
        datapoints++;
      }
    }
    // observation['grid-emission'] = cumulative_emission;
    // observation['grid-points'] = datapoints;
    observation['grid-ci'] = cumulative_emission / datapoints;
    return observation;
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
    return 'org.wattime.grid';
  }
}
