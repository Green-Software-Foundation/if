import {IImpactModelInterface} from "./interfaces/index";
import axios from "axios";

export {
    IImpactModelInterface
} from "./interfaces/index";


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


    async usage(data: object): Promise<object> {
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

export class BoaviztaCpuImpactModel implements IImpactModelInterface {
    private componentType = "cpu";
    private sharedParams: IBoaviztaCpuParams | undefined;
    public name: string | undefined;
    public verbose: boolean = false;
    public allocation: string = "total";
    protected authCredentials: any = undefined;


    modelIdentifier(): string {
        return "boavizta.component.sci"
    }

    authenticate(authParams: object) {
        this.authCredentials = authParams;
    }

    configure(name: string, staticParams: object | undefined): IImpactModelInterface {
        const staticParamCast = staticParams as IBoaviztaCpuParams
        if ('verbose' in staticParamCast) {
            this.verbose = staticParamCast.verbose ?? false;
            staticParamCast.verbose = undefined;
        }
        if ('allocation' in staticParamCast) {
            this.allocation = staticParamCast.allocation ?? "total";
            staticParamCast.allocation = undefined;
        }
        this.name = name;
        this.sharedParams = staticParamCast;
        return this;
    }

    configureTyped(name: string, staticParamCast: IBoaviztaCpuParams): IImpactModelInterface {
        if ('verbose' in staticParamCast) {
            this.verbose = staticParamCast.verbose ?? false;
            staticParamCast.verbose = undefined;
        }
        if ('allocation' in staticParamCast) {
            this.allocation = staticParamCast.allocation ?? "total";
            staticParamCast.allocation = undefined;
        }
        this.name = name;
        this.sharedParams = staticParamCast;
        return this;
    }

    async usage(data: object): Promise<object> {
        const usageCast = data as { [key: string]: any };
        if (this.sharedParams === undefined) {
            throw new Error("Improper Initialization: Missing configuration parameters")
        }
        const dataCast: { [key: string]: any } = Object.assign(this.sharedParams);
        dataCast['usage'] = usageCast
        const response = await axios.post(`https://api.boavizta.org/v1/component/${this.componentType}?verbose=${this.verbose}&allocation=${this.allocation}`, dataCast);
        const m = response.data['gwp']['manufacture'] * 1000
        // MJ to kWh , 1MJ eq 0.277778kWh
        const e = response.data['pe']['use'] / 3.6;
        return {
            "m": m,
            "e": e,
        };
    }
}
