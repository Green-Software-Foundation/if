import { IImpactModelInterface } from "./interfaces/index";
export { IImpactModelInterface } from "./interfaces/index";
export declare const camelToSnake: (str: string) => string;
export interface IBoaviztaStaticParams {
    provider?: string;
    componentType?: string;
}
export interface IBoaviztaCpuParams {
    coreUnits?: number;
    dieSize?: number;
    dieSizePerCore?: number;
    manufacturer?: string;
    modelRange?: string;
    family?: string;
    name?: string;
    tdp?: number;
    verbose?: boolean;
    allocation?: string;
}
export declare class BoaviztaCpuParams implements IBoaviztaCpuParams {
    coreUnits?: number;
    dieSize?: number;
    dieSizePerCore?: number;
    manufacturer?: string;
    modelRange?: string;
    family?: string;
    name?: string;
    tdp?: number;
    verbose?: boolean;
    allocation?: string;
}
export declare class BoaviztaCloudImpactModel implements IImpactModelInterface {
    provider: string | undefined;
    name: string | undefined;
    protected authCredentials: any;
    modelIdentifier(): string;
    configure(name: string, staticParams: object | undefined): IImpactModelInterface;
    configureTyped(name: string, staticParamCast: IBoaviztaStaticParams): IImpactModelInterface;
    authenticate(authParams: object): void;
    usage(data: object | object[]): Promise<object>;
}
export interface IBoaviztaUsageSCI {
    e: number;
    m: number;
}
export declare class BoaviztaCpuImpactModel implements IImpactModelInterface {
    private componentType;
    private sharedParams;
    name: string | undefined;
    verbose: boolean;
    allocation: string;
    protected authCredentials: any;
    modelIdentifier(): string;
    authenticate(authParams: object): void;
    configure(name: string, staticParams: object | undefined): IImpactModelInterface;
    private captureStaticParams;
    configureTyped(name: string, staticParamCast: IBoaviztaCpuParams): IImpactModelInterface;
    usage(data: object | object[]): Promise<object>;
    singleUsage(usageCast: {
        [p: string]: any;
    }): Promise<object>;
    private normalizeData;
    private formatResponse;
}
