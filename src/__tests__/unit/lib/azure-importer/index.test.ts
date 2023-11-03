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
    });
  });

  describe('configure(): ', () => {
    it('configures model instance with given params.', async () => {
      const name = 'mock-name';
      const params = {};
      const model = await new AzureImporterModel().configure(name, params);

      expect(model).toBeInstanceOf(AzureImporterModel);
    });
  });

  describe('authenticate(): ', () => {
    it('should keep provided auth params.', async () => {
      const name = 'mock-name';
      const params = {};
      const model = await new AzureImporterModel().configure(name, params);

      const authParams = {
        mock: 'mock',
      };

      const result = model.authenticate(authParams);

      expect(result).toBeUndefined();
    });
  });

  describe('execute(): ', () => {
    it.todo('');
  });
});
