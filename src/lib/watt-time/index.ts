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
        console.log(result);
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
    const params = {
      latitude: observation.location.latitude,
      longitude: observation.location.longitude,
      starttime: dayjs(observation.timestamp).format('YYYY-MM-DDTHH:mm:ssZ'),
      endtime: dayjs(observation.timestamp).add(
        observation.duration,
        'seconds'
      ),
    };
    const result = await axios.get(this.baseUrl + '/data', {
      params,
    });
    console.log(result);
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
