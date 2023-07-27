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
    private sharedParams: { [key: string]: any } | undefined = undefined;
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

    configure(name: string, staticParams: { [key: string]: any } | undefined = undefined): IImpactModelInterface {
        this.name = name;
        if (staticParams !== undefined) {
            this.sharedParams = this.captureStaticParams(staticParams as { [key: string]: any });
        }
        return this;
    }

    protected captureStaticParams(staticParamCast: { [key: string]: any }) {
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
        const usageCast = data as { [key: string]: any };
        let mTotal = 0;
        let eTotal = 0;
        if (Array.isArray(usageCast)) {
            for (const usageRaw of usageCast) {
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
                    const {m, e} = await this.singleUsage(usageRaw) as IBoaviztaUsageSCI
                    mTotal = m;
                    eTotal += e;
                }
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

    protected normalizeData(dataParams: object): { [key: string]: any } {
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
