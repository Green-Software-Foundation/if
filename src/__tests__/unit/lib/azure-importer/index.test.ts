import {AzureImporterModel} from '../../../../lib/azure-importer';

jest.setTimeout(30000);

describe('lib/azure-importer: ', () => {
  describe('init AzureImporterModel: ', () => {
    it('initalizes object with properties.', async () => {
      const model = await new AzureImporterModel();

      expect(model).toHaveProperty('authenticate');
      expect(model).toHaveProperty('configure');
      expect(model).toHaveProperty('execute');
      expect(model).toHaveProperty('modelIdentifier');

      expect(model).toHaveProperty('name');
      expect(model).toHaveProperty('authParams');
      expect(model).toHaveProperty('staticParams');
    });

    it('initializes object and test', async () => {
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

  describe('authenticate(): ', () => {
    it('');
  });

  describe('configure(): ', () => {
    it('');
  });

  describe('execute(): ', () => {
    it('');
  });

  describe('modelIdentifier(): ', () => {
    it('');
  });
});
