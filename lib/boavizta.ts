import {IImpactModelInterface} from "./interfaces/index";
import axios from "axios";

export {
    IImpactModelInterface
} from "./interfaces/index";


export const camelToSnake = (str: string): string =>
    str.replace(/([A-Z])/g, ($1: string) => `_${$1.toLowerCase()}`);


export interface IBoaviztaUsageSCI {
    e: number;
    m: number;
}

export class BoaviztaCpuImpactModel implements IImpactModelInterface {
    private componentType = "cpu";
    private sharedParams: object | undefined = undefined;
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

    configure(name: string, staticParams: object | undefined = undefined): IImpactModelInterface {
        this.name = name;
        if (staticParams !== undefined) {
            this.sharedParams = this.captureStaticParams(staticParams);
        }
        return this;
    }

    protected captureStaticParams(staticParams: object) {
        if ('verbose' in staticParams) {
            this.verbose = staticParams.verbose as boolean ?? false;
            staticParams.verbose = undefined;
        }
        if ('allocation' in staticParams) {
            this.allocation = staticParams.allocation as string ?? "TOTAL";
            staticParams.allocation = undefined;
        }
        return staticParams
    }

    private convertToHours(timeString: string): number {
        const numberPart = parseFloat(timeString);
        const unit = timeString.slice(-1).toLowerCase();

        switch (unit) {
            case 's':
                return numberPart / 3600; // 1 hour = 3600 seconds
            case 'm':
                return numberPart / 60; // 1 hour = 60 minutes
            case 'h':
                return numberPart;
            default:
                throw new Error('Invalid time string. Supported units are "s", "m", and "h".');
        }
    }

    async calculate(data: object | object[] | undefined = undefined): Promise<object> {
        let mTotal = 0;
        let eTotal = 0;
        if (Array.isArray(data)) {
            for (const usageRaw of data) {
                const {datetime, duration, cpu} = usageRaw;
                if (datetime !== undefined && duration !== undefined && cpu !== undefined) {
                    const usageInput: { [key: string]: any } = {
                        "hours_use_time": this.convertToHours(duration),
                        "time_workload": cpu * 100.0,
                    }
                    if (this.sharedParams !== undefined && 'location' in this.sharedParams) {
                        usageInput['usage_location'] = this.sharedParams['location']
                    }
                    const {m, e} = await this.singleUsage(usageInput) as IBoaviztaUsageSCI
                    mTotal = m;
                    eTotal += e;
                } else {
                    if (this.sharedParams !== undefined && 'location' in this.sharedParams) {
                        usageRaw['usage_location'] = this.sharedParams['location']
                    }
                    const {m, e} = await this.singleUsage(usageRaw) as IBoaviztaUsageSCI
                    mTotal = m;
                    eTotal += e;
                }
            }
        } else {
            const {m, e} = await this.singleUsage(data) as IBoaviztaUsageSCI
            mTotal += m;
            eTotal += e;
        }
        return {
            "e": eTotal,
            "m": mTotal
        };
    }

    async singleUsage(usageCast: object | undefined): Promise<object> {
        if (this.sharedParams === undefined) {
            throw new Error("Improper Initialization: Missing configuration parameters")
        }
        const dataCast = this.normalizeData(this.sharedParams) as { [key: string]: any };
        dataCast['usage'] = usageCast
        const response = await axios.post(`https://api.boavizta.org/v1/component/${this.componentType}?verbose=${this.verbose}&allocation=${this.allocation}`, dataCast);
        return this.formatResponse(response);
    }

    protected normalizeData(dataParams: object): object {
        const dataCast: { [key: string]: any } = Object.assign(dataParams);
        for (let key in dataCast) {
            dataCast[camelToSnake(key)] = dataCast[key]
            if (/[A-Z]/.test(key)) {
                delete dataCast[key]
            }
        }
        return dataCast;
    }

    private formatResponse(response: any): { m: number, e: number } {
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
