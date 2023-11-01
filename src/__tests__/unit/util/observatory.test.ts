import {describe, expect, it, jest} from '@jest/globals';
import {Observatory} from '../../../util/observatory';
import {BoaviztaCpuOutputModel} from '../../../lib';

describe('util/observatory: ', () => {
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
      expect(lab).toHaveProperty('getInputs');
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

      const boaviztaModel = await new BoaviztaCpuOutputModel().configure(
        'test',
        params
      );

      boaviztaModel.execute = jest.fn(() => Promise.resolve(expectedValue));

      const result = await lab.doInvestigationsWith(boaviztaModel);
      expect(result).toBeInstanceOf(Observatory);
    });

    it('reuses previous output value instead of inputs.', async () => {
      const lab = new Observatory(inputs);

      const boaviztaModel = await new BoaviztaCpuOutputModel().configure(
        'test',
        params
      );

      boaviztaModel.execute = jest.fn(() => Promise.resolve(expectedValue));
      const result1 = await lab.doInvestigationsWith(boaviztaModel);

      const inputs1: any = [
        {
          timestamp: '2023-07-06T00:00',
          duration: 3600,
          'cpu-util': 18.392,
          'energy-cpu': 2.5,
          'embodied-carbon': 0.619,
          e: 1,
        },
        {
          timestamp: '2023-08-06T00:00',
          duration: 3600,
          'cpu-util': 16,
          'energy-cpu': 2.5,
          'embodied-carbon': 0.619,
          e: 1,
        },
      ];

      boaviztaModel.execute = jest.fn(() => Promise.resolve(inputs1));
      const result2 = await lab.doInvestigationsWith(boaviztaModel);

      expect(result1.getInputs()).toEqual(result2.getInputs());
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
      const boaviztaModel = await new BoaviztaCpuOutputModel().configure(
        'test',
        params
      );

      boaviztaModel.execute = jest.fn(() => Promise.resolve(expectedValue));
      const result = await lab.doInvestigationsWith(boaviztaModel);

      expect(result).toBeInstanceOf(Observatory);
      expect(lab.getOutputs()).toEqual(expectedValue);
    });
  });

  describe('getInputs(): ', () => {
    it('initalized given obsercations.', () => {
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

      const lab = new Observatory(inputs);

      expect(lab.getInputs()).toEqual(inputs);
    });
  });
});
