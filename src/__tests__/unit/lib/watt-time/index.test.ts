import {describe, expect, jest, test} from '@jest/globals';
import {WattTimeGridEmissions} from '../../../../lib/watt-time/index';
import * as DATA from '../../../../__mocks__/watt-time/data.json';
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
        status: 200,
        data: {
          token: 'test_token',
        },
      });
    case 'https://api2.watttime.org/v2/data':
      return Promise.resolve({
        data: DATA,
        status: 200,
      });
  }
});
describe('watt-time:configure test', () => {
  test('initialize and test', async () => {
    const model = await new WattTimeGridEmissions().configure('watt-time', {
      username: 'test1',
      password: 'test2',
    });
    expect(model).toBeInstanceOf(WattTimeGridEmissions);
    await expect(
      model.execute([
        {
          location: '37.7749,-122.4194',
          timestamp: '2021-01-01T00:00:00Z',
          duration: 1200,
        },
      ])
    ).resolves.toStrictEqual([
      {
        location: '37.7749,-122.4194',
        timestamp: '2021-01-01T00:00:00Z',
        duration: 1200,
        'grid-carbon-intensity': 2185.332173907599,
      },
    ]);
    await expect(
      model.execute([
        {
          location: '37.7749,-122.4194',
          timestamp: '2021-01-01T00:00:00Z',
          duration: 120,
        },
      ])
    ).resolves.toStrictEqual([
      {
        location: '37.7749,-122.4194',
        timestamp: '2021-01-01T00:00:00Z',
        duration: 120,
        'grid-carbon-intensity': 2198.0087539832293,
      },
    ]);
    await expect(
      model.execute([
        {
          location: '37.7749,-122.4194',
          timestamp: '2021-01-01T00:00:00Z',
          duration: 300,
        },
      ])
    ).resolves.toStrictEqual([
      {
        location: '37.7749,-122.4194',
        timestamp: '2021-01-01T00:00:00Z',
        duration: 300,
        'grid-carbon-intensity': 2198.0087539832293,
      },
    ]);
    await expect(
      model.execute([
        {
          location: '37.7749,-122.4194',
          timestamp: '2021-01-01T00:00:00Z',
          duration: 360,
        },
      ])
    ).resolves.toStrictEqual([
      {
        location: '37.7749,-122.4194',
        timestamp: '2021-01-01T00:00:00Z',
        duration: 360,
        'grid-carbon-intensity': 2193.5995087395318,
      },
    ]);

    await expect(
      model.execute([
        {
          location: '37.7749,-122.4194',
          timestamp: '2021-01-01T00:00:00Z',
          duration: 3600,
        },
        {
          location: '37.7749,-122.4194',
          timestamp: '2021-01-02T01:00:00Z',
          duration: 3600,
        },
      ])
    ).rejects.toThrowError();
  });
});
