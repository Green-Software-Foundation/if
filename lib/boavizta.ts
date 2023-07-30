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

    //abstract subs to make compatibility with base interface. allows configure to be defined in base class
    protected abstract captureStaticParams(staticParams: object): any

    //defines the model identifier
    abstract modelIdentifier(): string

    //fetches data from Boavizta API according to the specific endpoint of the model
    abstract fetchData(usageData: object | undefined): Promise<object>


    // list of supported locations by the model
    async supportedLocations(): Promise<string[]> {
        const countries = await axios.get(`https://api.boavizta.org/v1/utils/country_code`)
        return Object.values(countries.data);
    }

    // converts the time string to hours
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

    // extracts information from Boavizta API response to return the impact in the format required by IMPL
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

    // converts the usage from IMPL input to the format required by Boavizta API.
    transformToBoaviztaUsage(duration: any, metric: any) {
        let usageInput: { [key: string]: any } = {
            "hours_use_time": this.convertToHours(duration),
            "time_workload": metric * 100.0,
        }
        usageInput = this.addLocationToUsage(usageInput);
        return usageInput;
    }

    // Calculates the impact of the given usage
    async calculate(observations: object | object[] | undefined = undefined): Promise<object> {
        let mTotal = 0;
        let eTotal = 0;
        if (Array.isArray(observations)) {
            if (observations.length === 0) {
                throw new Error("Parameter Not Given: Missing observations parameter")
            }
            for (const observation of observations) {
                const usageResult = await this.calculateUsageForObservation(observation);
                mTotal = usageResult.m;
                eTotal += usageResult.e;
            }
        } else {
            let m = 0, e = 0;
            if (observations !== undefined && observations !== null && Object.keys(observations).length > 0) {
                const usageResult = await this.calculateUsageForObservation(observations);
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

    // converts the usage to the format required by Boavizta API.
    protected async calculateUsageForObservation(observation: { [key: string]: any }) {
        if ('datetime' in observation && 'duration' in observation && this.metricType in observation) {
            const usageInput = this.transformToBoaviztaUsage(observation['duration'], observation[this.metricType]);
            return await this.fetchData(usageInput) as IBoaviztaUsageSCI
        } else if ('hours_use_time' in observation && 'time_workload' in observation) {
            const observationWithLocation = this.addLocationToUsage(observation);
            return await this.fetchData(observationWithLocation) as IBoaviztaUsageSCI
        } else {
            throw new Error("Invalid Input: Invalid observations parameter")
        }
    }

    // Adds location to usage if location is defined in sharedParams
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

