import {IImpactModelInterface} from '../lib';

/**
 * Observatory calculates impacts based on `observations` and `model`.
 */
export class Observatory {
  private observations: any[];
  private impact: any[];

  /**
   * Init observations object.
   */
  constructor(observations: any) {
    this.observations = observations;
  }

  /**
   * Calculates impact based on observations.
   */
  public async doInvestigationsWith(modelInstance: IImpactModelInterface) {
    const calculatedImpacts = await modelInstance.calculate(this.observations);

    const result = this.observations.map((observation: any, index: number) => ({
      ...observation,
      ...calculatedImpacts[index],
    }));

    this.impact = result;

    return this;
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
