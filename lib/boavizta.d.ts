import { IImpactModelInterface } from "./interfaces/index";
export { IImpactModelInterface } from "./interfaces/index";
export interface IBoaviztaStaticParams {
    provider?: string;
    componentType?: string;
}
export interface IBoaviztaCpuParams {
    core_units?: number;
    die_size?: number;
    die_size_per_core?: number;
    manufacturer?: string;
    model_range?: string;
    family?: string;
    name?: string;
    tdp?: number;
    verbose?: boolean;
    allocation?: string;
}
export declare class BoaviztaCpuParams implements IBoaviztaCpuParams {
    core_units?: number;
    die_size?: number;
    die_size_per_core?: number;
    manufacturer?: string;
    model_range?: string;
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
    usage(data: object): Promise<object>;
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
    configureTyped(name: string, staticParamCast: IBoaviztaCpuParams): IImpactModelInterface;
    usage(data: object | object[]): Promise<object>;
    private singleUsage;
}
