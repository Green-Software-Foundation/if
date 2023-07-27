import {IImpactModelInterface} from "./interfaces/index";
import axios from "axios";

export {
    IImpactModelInterface
} from "./interfaces/index";


export const camelToSnake = (str: string): string =>
    str.replace(/([A-Z])/g, ($1: string) => `_${$1.toLowerCase()}`);

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

export class BoaviztaCpuParams implements IBoaviztaCpuParams {
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

export class BoaviztaCloudImpactModel implements IImpactModelInterface {
    public provider: string | undefined;
    public name: string | undefined;
    protected authCredentials: any = undefined;

    modelIdentifier(): string {
        return "boavizta.cloud.sci"
    }

    configure(name: string, staticParams: object | undefined): IImpactModelInterface {
        const staticParamCast = staticParams as IBoaviztaStaticParams;
        if (staticParamCast?.hasOwnProperty('provider')) {
            this.provider = staticParamCast.provider;
        }
        this.name = name;
        return this;
    }

    configureTyped(name: string, staticParamCast: IBoaviztaStaticParams): IImpactModelInterface {
        if (staticParamCast?.hasOwnProperty('provider')) {
            this.provider = staticParamCast.provider;
        }
        this.name = name;
        return this;
    }

    authenticate(authParams: object) {
        this.authCredentials = authParams;
    }


    async usage(data: object | object[]): Promise<object> {
        const dataCast = data as { [key: string]: any };
        if ('provider' in dataCast) {
            if (this.provider !== undefined) {
                dataCast.provider = this.provider;
            } else {
                throw new Error('Malformed Telemetry: Missing provider');
            }
        }
        if ('instance_type' in dataCast) {
            throw new Error('Malformed Telemetry: Missing instance_type');
        }
        const response = await axios.post('https://api.boavizta.org/v1/cloud/', dataCast);
        return response.data;
    }
}

export interface IBoaviztaUsageSCI {
    e: number;
    m: number;
}

export class BoaviztaCpuImpactModel implements IImpactModelInterface {
    private componentType = "cpu";
    private sharedParams: IBoaviztaCpuParams | undefined;
    public name: string | undefined;
    public verbose: boolean = false;
    public allocation: string = "TOTAL";
    protected authCredentials: any = undefined;


    modelIdentifier(): string {
        return "boavizta.cpu.sci"
    }

    authenticate(authParams: object) {
        this.authCredentials = authParams;
    }

    configure(name: string, staticParams: object | undefined): IImpactModelInterface {
        const staticParamCast = this.captureStaticParams(staticParams as IBoaviztaCpuParams)
        this.name = name;
        this.sharedParams = staticParamCast;
        return this;
    }

    private captureStaticParams(staticParamCast: IBoaviztaCpuParams | (IBoaviztaCpuParams & {
        verbose: unknown
    }) | (IBoaviztaCpuParams & { allocation: unknown })) {
        if ('verbose' in staticParamCast) {
            this.verbose = staticParamCast.verbose ?? false;
            staticParamCast.verbose = undefined;
        }
        if ('allocation' in staticParamCast) {
            this.allocation = staticParamCast.allocation ?? "total";
            staticParamCast.allocation = undefined;
        }
        return staticParamCast
    }

    configureTyped(name: string, staticParamCast: IBoaviztaCpuParams): IImpactModelInterface {
        staticParamCast = this.captureStaticParams(staticParamCast)
        this.name = name;
        this.sharedParams = staticParamCast;
        return this;
    }

    async usage(data: object | object[]): Promise<object> {
        const usageCast = data as { [key: string]: any };
        let mTotal = 0;
        let eTotal = 0;
        if (Array.isArray(usageCast)) {
            for (const usage of usageCast) {
                const {m, e} = await this.singleUsage(usage) as IBoaviztaUsageSCI;
                mTotal += m;
                eTotal += e;
            }
        } else {
            const {m, e} = await this.singleUsage(usageCast) as IBoaviztaUsageSCI
            mTotal += m;
            eTotal += e;
        }
        return {
            "e": eTotal,
            "m": mTotal
        };
    }

    async singleUsage(usageCast: { [p: string]: any }): Promise<object> {
        if (this.sharedParams === undefined) {
            throw new Error("Improper Initialization: Missing configuration parameters")
        }
        const dataCast = this.normalizeData(this.sharedParams);
        dataCast['usage'] = usageCast
        const response = await axios.post(`https://api.boavizta.org/v1/component/${this.componentType}?verbose=${this.verbose}&allocation=${this.allocation}`, dataCast);
        return this.formatResponse(response);
    }

    private normalizeData(dataParams: object): { [key: string]: any } {
        const dataCast: { [key: string]: any } = Object.assign(dataParams);
        for (let key in dataCast) {
            dataCast[camelToSnake(key)] = dataCast[key]
            if (/[A-Z]/.test(key)) {
                delete dataCast[key]
            }
        }
        return dataCast;
    }

    private formatResponse(response: any) {
        let m = 0;
        let e = 0;
        if ('impacts' in response.data) {
            m = response.data['impacts']['gwp']['manufacture'] * 1000
            e = response.data['impacts']['pe']['use'] / 3.6;
        } else if ('gwp' in response.data && 'pe' in response.data) {
            m = response.data['gwp']['manufacture'] * 1000
            e = response.data['pe']['use'] / 3.6;
        }
        return {m, e};
    }
}
