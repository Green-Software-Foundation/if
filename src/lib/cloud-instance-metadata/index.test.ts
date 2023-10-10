import {describe, expect, jest, test} from '@jest/globals';
import {CloudInstanceMetadataModel} from './index';
jest.setTimeout(30000);

describe('ccf:configure test', () => {
  test('initialize and test', async () => {
    const model = await new CloudInstanceMetadataModel().configure('ccf', {});
    expect(model).toBeInstanceOf(CloudInstanceMetadataModel);
  });
});
