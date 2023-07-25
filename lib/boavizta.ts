import {IImpactModelInterface} from "./interfaces/index";
import axios from "axios";

export {
    IImpactModelInterface
} from "./interfaces/index";


export interface IBoaviztaStaticParams {
    provider?: string;
    componentType?: string;
}

export class BoaviztaCloudImpactModel implements IImpactModelInterface {
    public provider: string | undefined;
    public name: string | undefined;
    protected authCredentials: any = undefined;

    configure(name: string, staticParams: object | undefined): IImpactModelInterface {
        const staticParamCast = staticParams as IBoaviztaStaticParams;
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

export class BoaviztaComponentImpactModel implements IImpactModelInterface {
    public componentType: string | undefined;
    public name: string | undefined;
    protected authCredentials: any = undefined;

    authenticate(authParams: object) {
        this.authCredentials = authParams;
    }

    configure(name: string, staticParams: object | undefined): IImpactModelInterface {
        const staticParamCast = staticParams as IBoaviztaStaticParams;
        if ('componentType' in staticParamCast) {
            this.componentType = staticParamCast.componentType;
        }
        this.name = name;
        return this;
    }

    async usage(data: object): Promise<object> {
        const dataCast = data as { [key: string]: any };
        if (this.componentType === undefined) {
            throw new Error("Improper Initialization: Missing componentType")
        }
        const response = await axios.post(`https://api.boavizta.org/v1/component/${this.componentType}`, dataCast);
        return response.data;
    }

}
