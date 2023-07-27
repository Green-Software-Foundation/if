
export interface IImpactModelInterface {

    modelIdentifier(): string

    configure(name: string, staticParams: object | undefined): IImpactModelInterface

    //
    authenticate(authParams: object): void

    //
    usage(data: object | object[]): Promise<object>
}
