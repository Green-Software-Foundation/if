import {BoaviztaCpuImpactModel} from '../lib';

/**
 * Pipeline for computing impacts based on observation.
 */
export class Observatory {
  private observations: any;
  private impact: any;

  /**
   * Init observations object.
   */
  constructor(observations: any) {
    this.observations = observations;
  }

  /**
   * Calculates impact based on observation and model.
   */
  private async monitorAndCalculateImpact(Model: any, params: any) {
    const modelInstance = await new Model().configure('test', params);

    const calculatedImpacts = await modelInstance.calculate(this.observations);

    const result = this.observations.map((observation: any, index: number) => ({
      ...observation,
      ...calculatedImpacts[index],
    }));

    this.impact = result;

    return this;
  }

  /**
   * Apply appropriate observation.
   */
  public doInvestigationsWith(modelType: string, params: any) {
    switch (modelType) {
      case 'boavizta':
        return this.monitorAndCalculateImpact(BoaviztaCpuImpactModel, params);
      // case 'ccf':
      //   return this.monitorAndCalculateImpact(CloudCarbonFootprint, params);
    }
  }

  /**
   * Getter for observation data.
   */
  public getObservationsData() {
    return this.observations;
  }

  /**
   * Getter for impact data.
   */
  public getObservedImpact() {
    return this.impact;
  }
}
