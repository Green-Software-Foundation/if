import {describe, expect, it, jest} from '@jest/globals';
import {Observatory} from '../../../util/observatory';
import {BoaviztaCpuImpactModel} from '../../../lib';

describe('util/observatory: ', () => {
  const expectedValue = [
    {
      timestamp: '2023-07-06T00:00',
      duration: 3600,
      'cpu-util': 18.392,
      'e-cpu': 2.5,
      'embodied-carbon': 0.619,
    },
    {
      timestamp: '2023-08-06T00:00',
      duration: 3600,
      'cpu-util': 16,
      'e-cpu': 2.5,
      'embodied-carbon': 0.619,
    },
  ]; // model.calculate method's result (impact mock).

  describe('init Observatory: ', () => {
    it('initializes object with required properties.', () => {
      const observations: any = [];
      const lab = new Observatory(observations);

      expect(lab).toHaveProperty('doInvestigationsWith');
      expect(lab).toHaveProperty('getImpacts');
      expect(lab).toHaveProperty('getObservations');
    });
  });

  describe('doInvestgationsWith(): ', () => {
    const observations: any = [
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
      processor: 'Intel® Core™ i7-1185G7',
      allocation: 'LINEAR',
      verbose: true,
    };

    it('returns Observatory class.', async () => {
      const lab = new Observatory(observations);

      const boaviztaModel = await new BoaviztaCpuImpactModel().configure(
        'test',
        params
      );

      boaviztaModel.calculate = jest.fn(() => Promise.resolve(expectedValue));

      const result = await lab.doInvestigationsWith(boaviztaModel);
      expect(result).toBeInstanceOf(Observatory);
    });

    it('reuses previous impact value instead of observations.', async () => {
      const lab = new Observatory(observations);

      const boaviztaModel = await new BoaviztaCpuImpactModel().configure(
        'test',
        params
      );

      boaviztaModel.calculate = jest.fn(() => Promise.resolve(expectedValue));
      const result1 = await lab.doInvestigationsWith(boaviztaModel);

      const observations1: any = [
        {
          timestamp: '2023-07-06T00:00',
          duration: 3600,
          'cpu-util': 18.392,
          'e-cpu': 2.5,
          'embodied-carbon': 0.619,
          e: 1,
        },
        {
          timestamp: '2023-08-06T00:00',
          duration: 3600,
          'cpu-util': 16,
          'e-cpu': 2.5,
          'embodied-carbon': 0.619,
          e: 1,
        },
      ];

      boaviztaModel.calculate = jest.fn(() => Promise.resolve(observations1));
      const result2 = await lab.doInvestigationsWith(boaviztaModel);

      expect(result1.getObservations()).toEqual(result2.getObservations());
    });
  });

  describe('getImpacts(): ', () => {
    const observations: any = [
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
      processor: 'Intel® Core™ i7-1185G7',
      allocation: 'LINEAR',
      verbose: true,
    };

    it('returns empty impacts data.', () => {
      const lab = new Observatory(observations);

      const expectedValue: any = [];

      expect(lab.getImpacts()).toEqual(expectedValue);
    });

    it('returns calculated impacts data.', async () => {
      const lab = new Observatory(observations);
      const boaviztaModel = await new BoaviztaCpuImpactModel().configure(
        'test',
        params
      );

      boaviztaModel.calculate = jest.fn(() => Promise.resolve(expectedValue));
      const result = await lab.doInvestigationsWith(boaviztaModel);

      expect(result).toBeInstanceOf(Observatory);
      expect(lab.getImpacts()).toEqual(expectedValue);
    });
  });

  describe('getObservations(): ', () => {
    it('initalized given obsercations.', () => {
      const observations: any = [
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

      const lab = new Observatory(observations);

      expect(lab.getObservations()).toEqual(observations);
    });
  });
});
