export interface IImpactModelInterface {

    modelIdentifier(): string

    configure(name: string, staticParams: { [key: string]: any } | undefined): IImpactModelInterface

    //
    authenticate(authParams: object): void

    //
    usage(data: object | object[]): Promise<object>
}
