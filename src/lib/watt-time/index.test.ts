import {describe, expect, jest, test} from '@jest/globals';
import {WattTimeGridEmissions} from './index';
jest.setTimeout(30000);

describe('watt-time:configure test', () => {
  test('initialize and test', async () => {
    const model = await new WattTimeGridEmissions().configure('watt-time', {});
    await model.authenticate({
      username: 'ENV_USERNAME',
      password: 'ENV_PASSWORD',
    });
    expect(model).toBeInstanceOf(WattTimeGridEmissions);
    // await expect(
    //   model.calculate([
    //     {
    //       sa,
    //     },
    //   ])
    // ).resolves.toStrictEqual([{}]);
  });
});
