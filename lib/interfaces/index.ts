export interface IImpactModelInterface {
    modelIdentifier(): string

    configure(name: string, staticParams: { [key: string]: any } | undefined): IImpactModelInterface

    authenticate(authParams: object): void

    calculate(data: object | object[] | undefined): Promise<object>
}
