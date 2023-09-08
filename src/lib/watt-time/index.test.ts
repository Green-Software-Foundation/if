import {describe, expect, jest, test} from '@jest/globals';
import {WattTimeGridEmissions} from './index';
import * as DATA from '../../__mocks__/watt-time/data.json';
import axios from 'axios';

jest.setTimeout(30000);

jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;
// Mock out all top level functions, such as get, put, delete and post:
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
mockAxios.get.mockImplementation(url => {
  switch (url) {
    case 'https://api2.watttime.org/v2/login':
      return Promise.resolve({
        data: {
          token: 'test_token',
        },
      });
    case 'https://api2.watttime.org/v2/data':
      return Promise.resolve({data: DATA});
  }
});
describe('watt-time:configure test', () => {
  test('initialize and test', async () => {
    const model = await new WattTimeGridEmissions().configure('watt-time', {
      username: 'ENV_USERNAME',
      password: 'ENV_PASSWORD',
    });
    expect(model).toBeInstanceOf(WattTimeGridEmissions);
    await expect(
      model.calculate([
        {
          location: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
          timestamp: '2021-01-01T00:00:00Z',
          duration: 3600,
        },
      ])
    ).resolves.toStrictEqual([
      {
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
        },
        timestamp: '2021-01-01T00:00:00Z',
        duration: 3600,
        'grid-ci': 2096.256940667132,
      },
    ]);
  });
});
