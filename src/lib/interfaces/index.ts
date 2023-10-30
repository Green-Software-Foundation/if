export interface IOutputModelInterface {
  modelIdentifier(): string;

  // params is a reserved keyword in C#. Hence it can not be used.
  configure(
    name: string,
    staticParams: object | undefined
  ): Promise<IOutputModelInterface>;

  authenticate(authParams: object): void;

  execute(inputs: object | object[] | undefined): Promise<any[]>;
}
export * from './ccf';
