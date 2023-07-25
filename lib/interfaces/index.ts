export interface IImpactModelInterface {
    configure(name: string, staticParams: object | undefined): IImpactModelInterface
    //
    authenticate(authParams: object): void
    //
    usage(data: object): Promise<object>
}
