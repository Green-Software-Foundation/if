import {describe, expect, jest, test} from '@jest/globals';
import {WattTimeGridEmissions} from './index';
jest.setTimeout(30000);

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
