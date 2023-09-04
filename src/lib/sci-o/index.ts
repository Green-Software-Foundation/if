import {IImpactModelInterface} from '../interfaces';

export class SciOModel implements IImpactModelInterface {
  authParams: object | undefined = undefined;
  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  calculate(observations: object | object[] | undefined): Promise<object[]> {
    return Promise.resolve([]);
  }

  configure(
    name: string,
    staticParams: object | undefined
  ): Promise<IImpactModelInterface> {
    return Promise.resolve(undefined);
  }

  modelIdentifier(): string {
    return '';
  }
}
