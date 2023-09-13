import axios from 'axios';
import * as dayjs from 'dayjs';

import {IImpactModelInterface} from '../interfaces';

import {CONFIG} from '../../config';

import {KeyValuePair} from '../../types/common';

const {MODEL_IDS} = CONFIG;
const {WATT_TIME} = MODEL_IDS;

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

      const tokenResponse = await axios.get(`${this.baseUrl}/login`, {
        auth: {
          username,
          password,
        },
      });
      console.log('TOKEN RESP', tokenResponse);
      if (
        tokenResponse === undefined ||
        tokenResponse.data === undefined ||
        !('token' in tokenResponse.data)
      ) {
        throw new Error(
          'Missing token in response. Invalid credentials provided.'
        );
      }
      this.token = tokenResponse.data.token;
    }
  }

  async calculate(observations: object | object[] | undefined): Promise<any[]> {
    if (!Array.isArray(observations)) {
      throw new Error('observations should be an array');
    }
    let starttime = dayjs('9999-12-31');
    let endtime = dayjs('1970-01-01');
    const blockpairs = [];
    const times = [];
    observations.map((observation: KeyValuePair) => {
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
      const duration = observation.duration;
      times.push(dayjs(observation.timestamp));

      starttime = dayjs(observation.timestamp).isBefore(starttime)
        ? dayjs(observation.timestamp)
        : starttime;
      endtime = dayjs(observation.timestamp)
        .add(duration, 'seconds')
        .isAfter(endtime)
        ? dayjs(observation.timestamp).add(duration, 'seconds')
        : endtime;
      blockpairs.push({
        start: dayjs(observation.timestamp),
        end: dayjs(observation.timestamp).add(duration, 'seconds'),
      });
      console.log('starttime', starttime.format());
      console.log('endtime', endtime.format());
    });
    const fetchDuration = endtime.diff(starttime, 'seconds');
    console.log('fetchDuration', fetchDuration);
    if (fetchDuration > 32 * 24 * 60 * 60) {
      throw new Error(
        'duration is too long.WattTime API only supports up to 32 days. All observations must be within 32 days of each other. Duration of ' +
          fetchDuration +
          ' seconds is too long.'
      );
    }
    const wattimedata = await this.fetchData({
      location: observations[0].location,
      timestamp: starttime.format(),
      duration: fetchDuration,
    });
    console.log('wattime data:', wattimedata);
    observations.map((observation: KeyValuePair) => {
      const observationStart = dayjs(observation.timestamp);
      const observationDuration = observation.duration;
      const observationEnd = observationStart.add(
        observationDuration,
        'seconds'
      );
      console.log(observationStart.format());
      console.log(observationEnd.format());
      let datapoints = 0;
      const data = wattimedata.map((data: KeyValuePair) => {
        if (dayjs(data.point_time).isBefore(observationStart)) {
          return 0;
        }
        if (
          dayjs(data.point_time).isAfter(observationEnd) ||
          dayjs(data.point_time).format() === dayjs(observationEnd).format()
        ) {
          return 0;
        }
        console.log('measuring for', observation.timestamp);
        console.log('data', data);
        // lbs/MWh to kg/MWh to g/kWh (kg/MWh == g/kWh as a ratio)
        const grid_emission = data.value / 0.45359237;
        console.log('emissions raw:', data.value);
        // convert to kg/kWh by dividing by 1000. (1MWh = 1000kWh)
        // convert to g/kWh by multiplying by 1000. (1kg = 1000g)
        // hence each other cancel out and g/kWh is the same as kg/MWh
        datapoints += 1;
        return grid_emission;
      });
      const emissionSum = data.reduce((a: number, b: number) => a + b, 0);
      console.log('data', data);
      if (datapoints === 0) {
        throw new Error('Did not receive data from WattTime API');
      }
      console.log('datapoints', datapoints, data.length);
      console.log('emissionAvg', emissionSum / datapoints);
      observation['grid-ci'] = emissionSum / datapoints;
    });

    return Promise.resolve(observations as any[]);
  }

  async fetchData(observation: KeyValuePair): Promise<KeyValuePair[]> {
    const duration = observation.duration;
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
    const result = await axios.get(`${this.baseUrl}/data`, {
      params,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    return result.data.sort((a: any, b: any) => {
      return dayjs(a.point_time).unix() > dayjs(b.point_time).unix() ? 1 : -1;
    });
  }

  async configure(
    name: string,
    staticParams: object | undefined
  ): Promise<IImpactModelInterface> {
    this.staticParams = staticParams;
    this.name = name;
    if (!staticParams) {
      throw new Error('Missing staticParams');
    }
    await this.authenticate(staticParams);
    return this;
  }

  modelIdentifier(): string {
    return WATT_TIME;
  }
}
