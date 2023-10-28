export interface IImpactBaseInterface {
  modelIdentifier(): string;

  // params is a reserved keyword in C#. Hence it can not be used.
  configure(
    name: string,
    staticParams: object | undefined
  ): Promise<IImpactBaseInterface>;

  authenticate(authParams: object): void;
}

export interface IImpactModelInterface extends IImpactBaseInterface {
  calculate(observations: object | object[] | undefined): Promise<any[]>;
}

export interface IImpactImporterInterface extends IImpactBaseInterface {
  importObservations(): Promise<any[]>;
}

export * from './ccf';
