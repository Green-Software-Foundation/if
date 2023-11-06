import {AzureImporterModel} from '../../../../lib/azure-importer';
import {describe, expect, jest, it} from '@jest/globals';

jest.setTimeout(30000);

describe('lib/azure-importer: ', () => {
  describe('init AzureImporterModel: ', () => {
    it('initalizes object with properties.', async () => {
      const azureModel = await new AzureImporterModel();
      expect(azureModel).toHaveProperty('authenticate');
      expect(azureModel).toHaveProperty('configure');
      expect(azureModel).toHaveProperty('execute');
    });
  });

  describe('authenticate(): ', () => {
    it('authenticate is undefined', async () => {
      const azureModel = await new AzureImporterModel().configure('name', {});
      expect(azureModel).toBeInstanceOf(AzureImporterModel);
      await expect(azureModel.authenticate({})).toBe(undefined);
    });
  });

  describe('configure(): ', () => {
    it('configure returns name and empty config', async () => {
      const azureModel = new AzureImporterModel();
      await expect(azureModel.configure('azure', {})).resolves.toBeInstanceOf(
        AzureImporterModel
      );
      expect(azureModel.name).toBe('azure');
      expect(azureModel.staticParams).toStrictEqual({});
    });
  });

  describe('modelIdentifier(): ', () => {
    it('modelIdendifier() returns expected name', async () => {
      const azureModel = new AzureImporterModel();
      expect(azureModel.modelIdentifier()).toBe('azure');
    });
  });

  describe('execute(): ', () => {
    it('execute() throws error for missing input field ', async () => {
      const azureModel = new AzureImporterModel();
      expect(await azureModel.configure('azure', {})).toBeInstanceOf(
        AzureImporterModel
      );
      await expect(
        azureModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'azure-observation-aggregation': 'average',
            'azure-subscription-id': '9de7e19f-8a18-4e73-9451-45fc74e7d0d3',
            'azure-resource-group': 'vm1_group',
            'azure-vm-name': 'vm1',
          },
        ])
      ).rejects.toThrowError();
    });

    it('execute() throws error for time unit of seconds ', async () => {
      const azureModel = new AzureImporterModel();
      await expect(
        azureModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'azure-observation-window': '5 sec',
            'azure-observation-aggregation': 'average',
            'azure-subscription-id': '9de7e19f-8a18-4e73-9451-45fc74e7d0d3',
            'azure-resource-group': 'vm1_group',
            'azure-vm-name': 'vm1',
          },
        ])
      ).rejects.toStrictEqual(
        Error('The minimum unit of time for azure importer is minutes')
      );
    });

    it('execute() throws error for time unit of seconds ', async () => {
      const azureModel = new AzureImporterModel();
      await expect(
        azureModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'azure-observation-window': '5 sec',
            'azure-observation-aggregation': 'average',
            'azure-subscription-id': '9de7e19f-8a18-4e73-9451-45fc74e7d0d3',
            'azure-resource-group': 'vm1_group',
            'azure-vm-name': 'vm1',
          },
        ])
      ).rejects.toStrictEqual(
        Error('The minimum unit of time for azure importer is minutes')
      );
    });
  });
});
