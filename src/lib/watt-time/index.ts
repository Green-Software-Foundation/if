import {IImpactModelInterface} from '../interfaces';
import {KeyValuePair} from '../../types/boavizta';
import axios from 'axios';

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
  ): Promise<object[]> {
    if (!Array.isArray(observations)) {
      throw new Error('observations should be an array');
    }
    observations.map((observation: KeyValuePair) => {
      return observation;
    });

    return Promise.resolve(observations);
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
