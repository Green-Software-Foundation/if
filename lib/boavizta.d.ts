import { IImpactModelInterface } from "./interfaces/index";
export { IImpactModelInterface } from "./interfaces/index";
export interface IBoaviztaStaticParams {
    provider?: string;
    componentType?: string;
}
export declare class BoaviztaCloudImpactModel implements IImpactModelInterface {
    provider: string | undefined;
    name: string | undefined;
    protected authCredentials: any;
    configure(name: string, staticParams: object | undefined): IImpactModelInterface;
    authenticate(authParams: object): void;
    usage(data: object): Promise<object>;
}
export declare class BoaviztaComponentImpactModel implements IImpactModelInterface {
    componentType: string | undefined;
    name: string | undefined;
    protected authCredentials: any;
    authenticate(authParams: object): void;
    configure(name: string, staticParams: object | undefined): IImpactModelInterface;
    usage(data: object): Promise<object>;
}
