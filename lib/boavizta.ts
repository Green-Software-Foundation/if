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
    expectedLifespan: number = 4;


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

    // extracts information from Boavizta API response to return the impact in the format required by IMPL
    protected formatResponse(response: any, usageData: { [key: string]: any } = {}): { [p: string]: any } {
        let m = 0;
        let e = 0;
        if ('impacts' in response.data) {
            // manufacture impact is in kgCO2eq, convert to gCO2eq
            m = response.data['impacts']['gwp']['manufacture'] * 1000
            // use impact is in J , convert to kWh.
            // 1,000,000 J / 3600 = 277.7777777777778 Wh.
            // 1 MJ / 3.6 = 0.278 kWh
            e = response.data['impacts']['pe']['use'] / 3.6;
        } else if ('gwp' in response.data && 'pe' in response.data) {
            // manufacture impact is in kgCO2eq, convert to gCO2eq
            m = response.data['gwp']['manufacture'] * 1000
            // use impact is in J , convert to kWh.
            // 1,000,000 J / 3600 = 277.7777777777778 Wh.
            // 1 MJ / 3.6 = 0.278 kWh
            e = response.data['pe']['use'] / 3.6;
        }
        const hours_use_time = usageData['hours_use_time'] ?? 0;
        // M = TE * (TR/EL) * (RR/TR)
        //
        // Where:
        //
        // TE = Total Embodied Emissions, the sum of Life Cycle Assessment(LCA) emissions for all hardware components
        // TR = Time Reserved, the length of time the hardware is reserved for use by the software
        // EL = Expected Lifespan, the anticipated time that the equipment will be installed
        // RR = Resources Reserved, the number of resources reserved for use by the software.
        // TR = Total Resources, the total number of resources available.
        m = m * (hours_use_time / (8760.0 * this.expectedLifespan)) * (1.0 / 1.0);
        return {m, e};
    }

    // converts the usage from IMPL input to the format required by Boavizta API.
    transformToBoaviztaUsage(duration: any, metric: any) {
        let usageInput: { [key: string]: any } = {
            "hours_use_time": duration / 3600.0,
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
            throw new Error("Parameter Not Given: invalid observations parameter. Expecting an array of observations")
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
    public expectedLifespan: number = 4;

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
        if ('expected_lifespan' in staticParams) {
            this.expectedLifespan = staticParams.expected_lifespan as number ?? 0;
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
        return this.formatResponse(response, usageData);
    }
}

