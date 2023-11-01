import {describe, expect, jest, test} from '@jest/globals';
import {AzureImporterModel} from '../../../../lib/azure-importer/index';
jest.setTimeout(30000);

describe('sci:configure test', () => {
  test('initialize and test', async () => {
    const model = await new AzureImporterModel().configure('name', {});
    expect(model).toBeInstanceOf(AzureImporterModel);
    await expect(
      model.execute([
        {
          duration: 3600,
          timestamp: '2023-11-01T14:45:00Z',
          interval: 'PT1M',
          timespan: 'PT1H',
          aggregation: 'average',
        },
      ])
    ).resolves.toStrictEqual(['dummy']);
  });
});
