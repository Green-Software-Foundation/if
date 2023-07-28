export interface IImpactModelInterface {
    modelIdentifier(): string

    // params is a reserved keyword in C#. Hence it can not be used.
    configure(name: string, staticParams: object | undefined): Promise<IImpactModelInterface>

    authenticate(authParams: object): void

    calculate(observations: object | object[] | undefined): Promise<object>
}
