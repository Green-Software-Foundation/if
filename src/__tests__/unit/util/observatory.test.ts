import {ModelPluginInterface} from '../../../types/model-interface';
import {Observatory} from '../../../util/observatory';

describe('util/observatory: ', () => {
  class MockaviztaModel implements ModelPluginInterface {
    configure(params: any): Promise<ModelPluginInterface> {
      params;
      return Promise.resolve(this);
    }
    execute(): Promise<any[]> {
      return Promise.resolve([{data: 'mock-data'}]);
    }
  }

  const expectedValue = [
    {
      timestamp: '2023-07-06T00:00',
      duration: 3600,
      'cpu-util': 18.392,
      'energy-cpu': 2.5,
      'embodied-carbon': 0.619,
    },
    {
      timestamp: '2023-08-06T00:00',
      duration: 3600,
      'cpu-util': 16,
      'energy-cpu': 2.5,
      'embodied-carbon': 0.619,
    },
  ]; // model.execute method's result (output mock).

  describe('init Observatory: ', () => {
    it('initializes object with required properties.', () => {
      const inputs: any = [];
      const lab = new Observatory(inputs);

      expect(lab).toHaveProperty('doInvestigationsWith');
      expect(lab).toHaveProperty('getOutputs');
    });
  });

  describe('doInvestgationsWith(): ', () => {
    const inputs: any = [
      {
        timestamp: '2023-07-06T00:00',
        duration: 3600,
        'cpu-util': 18.392,
      },
      {
        timestamp: '2023-08-06T00:00',
        duration: 3600,
        'cpu-util': 16,
      },
    ];

    const params = {
      'core-units': 24,
      'physical-processor': 'Intel® Core™ i7-1185G7',
      allocation: 'LINEAR',
      verbose: true,
    };

    it('returns Observatory class.', async () => {
      const lab = new Observatory(inputs);

      const boaviztaModel = await new MockaviztaModel().configure(params);

      boaviztaModel.execute = jest.fn(() => Promise.resolve(expectedValue));

      const result = await lab.doInvestigationsWith(boaviztaModel);
      expect(result).toBeInstanceOf(Observatory);
    });
  });

  describe('getOutputs(): ', () => {
    const inputs: any = [
      {
        timestamp: '2023-07-06T00:00',
        duration: 3600,
        'cpu-util': 18.392,
      },
      {
        timestamp: '2023-08-06T00:00',
        duration: 3600,
        'cpu-util': 16,
      },
    ];

    const params = {
      'core-units': 24,
      'physical-processor': 'Intel® Core™ i7-1185G7',
      allocation: 'LINEAR',
      verbose: true,
    };

    it('returns empty outputs data.', () => {
      const lab = new Observatory(inputs);

      const expectedValue: any = [];

      expect(lab.getOutputs()).toEqual(expectedValue);
    });

    it('returns executed outputs data.', async () => {
      const lab = new Observatory(inputs);
      const boaviztaModel = await new MockaviztaModel().configure(params);

      boaviztaModel.execute = jest.fn(() => Promise.resolve(expectedValue));
      const result = await lab.doInvestigationsWith(boaviztaModel);

      expect(result).toBeInstanceOf(Observatory);
      expect(lab.getOutputs()).toEqual(expectedValue);
    });
  });
});
