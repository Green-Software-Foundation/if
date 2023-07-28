import {IImpactModelInterface} from "./interfaces/index";
import axios from "axios";

export {
    IImpactModelInterface
} from "./interfaces/index";


abstract class BoaviztaImpactModel implements IImpactModelInterface {
    protected authCredentials: object | undefined;
    name: string | undefined;
    sharedParams: object | undefined = undefined;
    metricType: "cpu" | "gpu" | "ram" = "cpu";


    authenticate(authParams: object) {
        this.authCredentials = authParams;
    }

    async configure(name: string, staticParams: object | undefined = undefined): Promise<IImpactModelInterface> {
        this.name = name;
        this.sharedParams = await this.captureStaticParams(staticParams ?? {});
        return this
    }

    //abstract subs to make compatibility
    protected abstract captureStaticParams(staticParams: object): any

    abstract modelIdentifier(): string

    abstract fetchData(usageData: object | undefined): Promise<object>


    async supportedLocations(): Promise<string[]> {
        const countries = await axios.get(`https://api.boavizta.org/v1/utils/country_code`)
        return Object.values(countries.data);
    }

    protected convertToHours(timeString: string): number {
        const numberPart = parseFloat(timeString);
        const unit = timeString.slice(-1).toLowerCase();

        switch (unit) {
            case 's':
                return numberPart / 3600; // 1 hour = 3600 seconds
            case 'm':
                return numberPart / 60; // 1 hour = 60 minutes
            case 'h':
                return numberPart;
            case 'd':
                return numberPart * 24;
            case 'w':
                return numberPart * 24 * 7;
            default:
                throw new Error('Invalid time string. Supported units are "s", "m", and "h".');
        }
    }

    protected formatResponse(response: any): { [key: string]: any } {
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

    transformToBoaviztaUsage(duration: any, metric: any) {
        let usageInput: { [key: string]: any } = {
            "hours_use_time": this.convertToHours(duration),
            "time_workload": metric * 100.0,
        }
        usageInput = this.addLocationToUsage(usageInput);
        return usageInput;
    }

    async calculate(observations: object | object[] | undefined = undefined): Promise<object> {
        let mTotal = 0;
        let eTotal = 0;
        if (Array.isArray(observations)) {
            if (observations.length === 0) {
                throw new Error("Parameter Not Given: Missing observations parameter")
            }
            for (const usageRaw of observations) {
                const usageResult = await this.calculateUsageForItem(usageRaw);
                mTotal = usageResult.m;
                eTotal += usageResult.e;
            }
        } else {
            let m = 0, e = 0;
            if (observations !== undefined) {
                const usageResult = await this.calculateUsageForItem(observations);
                m = usageResult.m;
                e = usageResult.e;
            } else {
                throw new Error("Parameter Not Given: Missing observations parameter")
            }
            mTotal += m;
            eTotal += e;
        }
        return {
            "e": eTotal,
            "m": mTotal
        };
    }

    protected async calculateUsageForItem(usageRaw: { [key: string]: any }) {
        if ('datetime' in usageRaw && 'duration' in usageRaw && this.metricType in usageRaw) {
            const usageInput = this.transformToBoaviztaUsage(usageRaw['duration'], usageRaw[this.metricType]);
            return await this.fetchData(usageInput) as IBoaviztaUsageSCI
        } else if ('hours_use_time' in usageRaw && 'time_workload' in usageRaw) {
            const usageRawWithLocation = this.addLocationToUsage(usageRaw);
            return await this.fetchData(usageRawWithLocation) as IBoaviztaUsageSCI
        } else {
            throw new Error("Invalid Input: Invalid observations parameter")
        }
    }

    addLocationToUsage(usageRaw: { [key: string]: any }) {
        if (this.sharedParams !== undefined && 'location' in this.sharedParams) {
            usageRaw['usage_location'] = this.sharedParams['location']
        }
        return usageRaw;
    }
}

export interface IBoaviztaUsageSCI {
    e: number;
    m: number;
}


export class BoaviztaCpuImpactModel extends BoaviztaImpactModel implements IImpactModelInterface {
    private readonly componentType = "cpu";
    sharedParams: object | undefined = undefined;
    public name: string | undefined;
    public verbose: boolean = false;
    public allocation: string = "TOTAL";

    constructor() {
        super();
        this.metricType = "cpu";
        this.componentType = "cpu";
    }

    modelIdentifier(): string {
        return "org.boavizta.cpu.sci"
    }

    protected async captureStaticParams(staticParams: object): Promise<object> {
        if ('verbose' in staticParams) {
            this.verbose = staticParams.verbose as boolean ?? false;
            staticParams.verbose = undefined;
        }
        if ('allocation' in staticParams) {
            const allocation = staticParams.allocation as string ?? "TOTAL";
            if (["TOTAL", "LINEAR"].includes(allocation)) {
                this.allocation = allocation;
            } else {
                throw new Error("Improper configure: Invalid allocation parameter. Either TOTAL or LINEAR");
            }
            staticParams.allocation = undefined;
        }
        if (!('name' in staticParams)) {
            throw new Error("Improper configure: Missing name parameter");
        }
        if (!('core_units' in staticParams)) {
            throw new Error("Improper configure: Missing core_units parameter");
        }
        this.sharedParams = Object.assign({}, staticParams);
        return this.sharedParams
    }


    async fetchData(usageData: object | undefined): Promise<object> {
        if (this.sharedParams === undefined) {
            throw new Error("Improper configure: Missing configuration parameters")
        }
        const dataCast = this.sharedParams as { [key: string]: any };
        dataCast['usage'] = usageData
        const response = await axios.post(`https://api.boavizta.org/v1/component/${this.componentType}?verbose=${this.verbose}&allocation=${this.allocation}`, dataCast);
        return this.formatResponse(response);
    }
}

