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
      // Extracting username and password from authParams
      let username =
        'username' in authParams ? (authParams['username'] as string) : '';
      let password =
        'password' in authParams ? (authParams['password'] as string) : '';

      // if username or password is ENV_<env_var_name>, then extract the value from the environment variable
      if (username.startsWith('ENV_')) {
        username = process.env[username.slice(4)] ?? '';
      }

      if (password.startsWith('ENV_')) {
        password = process.env[password.slice(4)] ?? '';
      }

      //  WattTime API requires username and password / token
      if (username === '' || password === '') {
        throw new Error('Missing username or password & token');
      }

      // Login to WattTime API to get a token
      const tokenResponse = await axios.get(`${this.baseUrl}/login`, {
        auth: {
          username,
          password,
        },
      });
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
    // validate observations for location data + timestamp + duration
    this.validateObservations(observations);
    // determine the earliest start and total duration of all observation blocks
    const {startTime, fetchDuration} =
      this.determineObservationStartEnd(observations);
    // fetch data from WattTime API for the entire duration
    const wattimedata = await this.fetchData({
      timestamp: startTime.format(),
      duration: fetchDuration,
      ...observations[0],
    });
    // for each observation block, calculate the average emission
    observations.map((observation: KeyValuePair) => {
      const observationStart = dayjs(observation.timestamp);
      const observationEnd = observationStart.add(
        observation.duration,
        'seconds'
      );
      const {datapoints, data} = this.getWattTimeDataForDuration(
        wattimedata,
        observationStart,
        observationEnd
      );
      const emissionSum = data.reduce((a: number, b: number) => a + b, 0);
      if (datapoints === 0) {
        throw new Error(
          'Did not receive data from WattTime API for the observation block.'
        );
      }
      observation['grid-ci'] = emissionSum / datapoints;
    });

    return observations;
  }

  private getWattTimeDataForDuration(
    wattimedata: KeyValuePair[],
    observationStart: dayjs.Dayjs,
    observationEnd: dayjs.Dayjs
  ): {datapoints: number; data: number[]} {
    let datapoints = 0;
    const data = wattimedata.map((data: KeyValuePair) => {
      // WattTime API returns full data for the entire duration.
      // if the data point is before the observation start, ignore it
      if (dayjs(data.point_time).isBefore(observationStart)) {
        return 0;
      }
      // if the data point is after the observation end, ignore it.
      // if the data point is exactly the same as the observation end, ignore it
      if (
        dayjs(data.point_time).isAfter(observationEnd) ||
        dayjs(data.point_time).format() === dayjs(observationEnd).format()
      ) {
        return 0;
      }
      // lbs/MWh to Kg/MWh by dividing by 0.453592 (0.453592 Kg/lbs)
      // (Kg/MWh == g/kWh)
      // convert to kg/KWh by dividing by 1000. (1MWh = 1000KWh)
      // convert to g/KWh by multiplying by 1000. (1Kg = 1000g)
      // hence each other cancel out and g/KWh is the same as kg/MWh
      const grid_emission = data.value / 0.45359237;
      datapoints += 1;
      return grid_emission;
    });
    return {datapoints, data};
  }

  private validateObservations(observations: object[]) {
    observations.forEach((observation: KeyValuePair) => {
      if (!('location' in observation)) {
        const {latitude, longitude} =
          this.getLatitudeLongitudeFromObservation(observation);
        if (isNaN(latitude) || isNaN(longitude)) {
          throw new Error('latitude or longitude is not a number');
        }
      }
      if (!('timestamp' in observation)) {
        throw new Error('timestamp is missing');
      }
      if (!('duration' in observation)) {
        throw new Error('duration is missing');
      }
    });
  }

  private getLatitudeLongitudeFromObservation(observation: KeyValuePair) {
    const location = observation['location'].split(','); //split location into latitude and longitude
    if (location.length !== 2) {
      throw new Error(
        'location should be a comma separated string of latitude and longitude'
      );
    }
    if (location[0] === '' || location[1] === '') {
      throw new Error('latitude or longitude is missing');
    }
    if (location[0] === '0' || location[1] === '0') {
      throw new Error('latitude or longitude is missing');
    }
    const latitude = parseFloat(location[0]); //convert latitude to float
    const longitude = parseFloat(location[1]); //convert longitude to float
    return {latitude, longitude};
  }

  private determineObservationStartEnd(observations: object[]) {
    // largest possible start time
    let starttime = dayjs('9999-12-31');
    // smallest possible end time
    let endtime = dayjs('1970-01-01');
    observations.forEach((observation: KeyValuePair) => {
      const duration = observation.duration;

      // if the observation timestamp is before the current starttime, set it as the new starttime
      starttime = dayjs(observation.timestamp).isBefore(starttime)
        ? dayjs(observation.timestamp)
        : starttime;

      // if the observation timestamp + duration is after the current endtime, set it as the new endtime
      endtime = dayjs(observation.timestamp)
        .add(duration, 'seconds')
        .isAfter(endtime)
        ? dayjs(observation.timestamp).add(duration, 'seconds')
        : endtime;
    });
    const fetchDuration = endtime.diff(starttime, 'seconds');
    if (fetchDuration > 32 * 24 * 60 * 60) {
      throw new Error(
        'duration is too long.WattTime API only supports up to 32 days. All observations must be within 32 days of each other. Duration of ' +
          fetchDuration +
          ' seconds is too long.'
      );
    }
    return {startTime: starttime, fetchDuration};
  }

  async fetchData(observation: KeyValuePair): Promise<KeyValuePair[]> {
    const duration = observation.duration;
    // WattTime API only supports up to 32 days
    if (duration > 32 * 24 * 60 * 60) {
      throw new Error('duration is too long');
    }
    const {latitude, longitude} =
      this.getLatitudeLongitudeFromObservation(observation);

    const params = {
      latitude: latitude,
      longitude: longitude,
      starttime: dayjs(observation.timestamp).format('YYYY-MM-DDTHH:mm:ssZ'),
      endtime: dayjs(observation.timestamp).add(duration, 'seconds'),
    };
    const result = await axios
      .get(`${this.baseUrl}/data`, {
        params,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .catch(e => {
        throw new Error('Error fetching data from WattTime API.' + e);
      });
    if (result.status !== 200) {
      throw new Error('Error fetching data from WattTime API.' + result.status);
    }
    if (!('data' in result) || !Array.isArray(result.data)) {
      throw new Error('Invalid response from WattTime API.');
    }
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
