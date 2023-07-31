import {IImpactModelInterface} from "../interfaces";
import * as aws_instances from './aws-instances.json';
import * as gcp_instances from './gcp-instances.json';
import * as azure_instances from './azure-instances.json';

export class CloudCarbonFootprint implements IImpactModelInterface {
    authParams: object | undefined;
    name: string | undefined;
    computeInstances: { [key: string]: any } = {};

    constructor() {
        this.standardizeInstanceMetrics();
    }

    authenticate(authParams: object): void {
        this.authParams = authParams;
    }

    async configure(name: string, staticParams: object | undefined = undefined): Promise<IImpactModelInterface> {
        console.log(name, staticParams)
        // if ('provider' in staticParams) {
        //
        // }
        console.log(aws_instances);
        console.log(azure_instances);
        console.log(gcp_instances);
        return this;
    }

    calculate(observations: object | object[] | undefined): Promise<object> {
        console.log(observations);
        return Promise.resolve({});
    }


    modelIdentifier(): string {
        return "ccf.cloud.sci";
    }

    standardizeInstanceMetrics() {
        this.computeInstances['aws'] = {};
        this.computeInstances['gcp'] = {};
        this.computeInstances['azure'] = {};
        aws_instances.forEach((instance: { [key: string]: any }) => {
            this.computeInstances['aws'][instance['Instance Type']] = {
                'instance_idle': instance['Instance @ Idle'],
                'instance_10': instance['Instance @ 10%'],
                'instance_50': instance['Instance @ 50%'],
                'instance_100': instance['Instance @ 100%'],
                'cpu': instance['Instance vCPU'],
            };
        });
        console.log(this.computeInstances);
        // for (let instance: { [key: string]: any } of aws_instances) {
        //     this.computeInstances[instance['Instance Type']] = {
        //         "cpu": instance.vcpu,
        //         "memory": instance.memory,
        //         "storage": instance.storage,
        //         "network": instance.network_performance,
        //         "cost": instance.pricing.on_demand,
        //         "provider": "aws"
        //     }
        // }
    }

}
