import {IImpactModelInterface} from "../interfaces";
import * as aws_instances from './aws-instances.json';
import * as gcp_instances from './gcp-instances.json';
import * as gcp_use from './gcp-use.json';
import * as aws_use from './aws-use.json';
import * as azure_use from './azure-use.json';
import * as azure_instances from './azure-instances.json';

export class CloudCarbonFootprint implements IImpactModelInterface {
    authParams: object | undefined;
    name: string | undefined;
    computeInstances: { [key: string]: any } = {};
    gcpList: { [key: string]: any } = {};
    azureList: { [key: string]: any } = {};
    awsList: { [key: string]: any } = {};
    provider: string = '';

    constructor() {
        this.standardizeInstanceMetrics();
    }

    authenticate(authParams: object): void {
        this.authParams = authParams;
    }

    async configure(name: string, staticParams: object | undefined = undefined): Promise<IImpactModelInterface> {
        console.log(name, staticParams)
        if (staticParams === undefined) {
            throw new Error('Required Parameters not provided');
        }
        if ('provider' in staticParams) {
            const provider = staticParams?.provider as string;
            if (['aws', 'gcp', 'azure'].includes(provider)) {
                this.provider = provider;
            } else {
                throw new Error('Provider not supported');
            }
        }
        if ('instance_type' in staticParams) {
            const instanceType = staticParams?.instance_type as string;
            if (instanceType in this.computeInstances[this.provider]) {
                this.name = instanceType;
            } else {
                throw new Error('Instance Type not supported');
            }
        }
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
        let gcpMin = 0.0;
        let gcpMax = 0.0;
        let gcpCount = 0;
        gcp_use.forEach((instance: { [key: string]: any }) => {
            this.gcpList[instance['Architecture']] = instance;
        });
        const gcpAvgMin = gcpMin / gcpCount;
        const gcpAvgMax = gcpMax / gcpCount;
        this.gcpList['Average'] = {
            'Min Watts': gcpAvgMin,
            'Max Watts': gcpAvgMax,
            'Architecture': 'Average',
        };
        let azureMin = 0.0;
        let azureMax = 0.0;
        let azureCount = 0;
        azure_use.forEach((instance: { [key: string]: any }) => {
            this.azureList[instance['Architecture']] = instance;
            azureMin += parseFloat(instance['Min Watts']);
            azureMax += parseFloat(instance['Max Watts']);
            azureCount += 1;
        });
        const azureAvgMin = azureMin / azureCount;
        const azureAvgMax = azureMax / azureCount;
        this.azureList['Average'] = {
            'Min Watts': azureAvgMin,
            'Max Watts': azureAvgMax,
            'Architecture': 'Average',
        }
        aws_use.forEach((instance: { [key: string]: any }) => {
            this.awsList[instance['Architecture']] = instance;
        });
        aws_instances.forEach((instance: { [key: string]: any }) => {
            this.computeInstances['aws'][instance['Instance type']] = {
                'instance_idle': instance['Instance @ Idle'].replace(',', '.'),
                'instance_10': instance['Instance @ 10%'].replace(',', '.'),
                'instance_50': instance['Instance @ 50%'].replace(',', '.'),
                'instance_100': instance['Instance @ 100%'].replace(',', '.'),
                'vCPUs': instance['Instance vCPU'],
            };
        });
        gcp_instances.forEach((instance: { [key: string]: any }) => {
            const cpus = parseInt(instance['Instance vCPUs'], 10);
            let architecture = instance['Microarchitecture'];
            if (!(architecture in this.azureList)) {
                architecture = 'Average';
            }
            this.computeInstances['gcp'][instance['Machine type']] = {
                'instance_min': this.gcpList[architecture]['Min Watts'] * cpus,
                'instance_max': this.gcpList[architecture]['Max Watts'] * cpus,
                'vCPUs': cpus
            };
        });
        azure_instances.forEach((instance: { [key: string]: any }) => {
            const cpus = parseInt(instance['Instance vCPUs'], 10);
            let architecture = instance['Microarchitecture'];
            if (!(architecture in this.azureList)) {
                architecture = 'Average';
            }
            this.computeInstances['azure'][instance['Virtual Machine']] = {
                'instance_min': this.azureList[architecture]['Min Watts'] * cpus,
                'instance_max': this.azureList[architecture]['Max Watts'] * cpus,
                'cpu': instance['Instance vCPUs'],
            };
        });
        console.log(this.computeInstances);
    }

}
