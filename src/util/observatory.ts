import {IImpactModelInterface} from '../lib';

/**
 * Observatory calculates impacts based on `observations` and `model`.
 */
export class Observatory {
  private observations: any[];
  private impact: any[] = [];

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
    const reuseCalculation = this.impact.length
      ? this.impact
      : this.observations;

    const calculatedImpacts = await modelInstance.calculate(reuseCalculation);

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
  public getObservations() {
    return this.observations;
  }

  /**
   * Getter for impact data.
   */
  public getImpacts() {
    return this.impact;
  }
}
