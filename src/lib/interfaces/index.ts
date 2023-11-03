export interface IOutputModelInterface {
  modelIdentifier(): string;

  configure(
    name: string,
    staticParams: object | undefined
  ): Promise<IOutputModelInterface>;

  authenticate(authParams: object): void;

  execute(inputs: object | object[] | undefined): Promise<any[]>;
}
export * from './ccf';
