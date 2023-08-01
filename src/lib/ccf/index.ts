import {IImpactModelInterface} from "../interfaces";
import Spline from 'typescript-cubic-spline';
import * as aws_instances from './aws-instances.json';
import * as gcp_instances from './gcp-instances.json';
import * as gcp_use from './gcp-use.json';
import * as aws_use from './aws-use.json';
import * as azure_use from './azure-use.json';
import * as azure_instances from './azure-instances.json';
import * as gcp_embodied from './gcp-embodied.json';
import * as aws_embodied from './aws-embodied.json';
import * as azure_embodied from './azure-embodied.json';

export class CloudCarbonFootprint implements IImpactModelInterface {
    authParams: object | undefined;
    name: string | undefined;
    computeInstances: { [key: string]: any } = {};
    gcpList: { [key: string]: any } = {};
    azureList: { [key: string]: any } = {};
    awsList: { [key: string]: any } = {};
    provider: string = '';
    instanceType: string = '';

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
                this.instanceType = instanceType;
            } else {
                throw new Error('Instance Type not supported');
            }
        }
        return this;
    }

    async calculate(observations: object | object[] | undefined): Promise<object> {
        console.log(observations);
        if (observations === undefined) {
            throw new Error('Required Parameters not provided');
        }
        let eTotal = 0.0;
        let mTotal = this.embodiedEmissions();
        if (Array.isArray(observations)) {
            observations.forEach((observation: { [key: string]: any }) => {
                eTotal += this.calculateEnergy(observation);
            });
        }
        console.log(mTotal, eTotal)
        return {
            "e": eTotal,
            "m": mTotal,
        };
    }

    calculateEnergy(observation: { [key: string]: any; }) {
        if (!('duration' in observation) || !('cpu' in observation) || !('datetime' in observation)) {
            throw new Error('Required Parameters duration,cpu,datetime not provided for observation');
        }
        const duration = observation['duration'];
        //     convert cpu usage to percentage
        const cpu = observation['cpu'] * 100.0;
        //     get the wattage for the instance type
        let wattage = 0;
        if (this.provider === 'aws') {
            const idle = this.computeInstances['aws'][this.instanceType]['instance_idle'];
            const tenPercent = this.computeInstances['aws'][this.instanceType]['instance_10'];
            const fiftyPercent = this.computeInstances['aws'][this.instanceType]['instance_50'];
            const hundredPercent = this.computeInstances['aws'][this.instanceType]['instance_100'];
            const x = [0, 10, 50, 100];
            const y: number[] = [idle, tenPercent, fiftyPercent, hundredPercent];
            const spline = new Spline(x, y);
            wattage = spline.at(cpu) as number;
        } else if (this.provider === 'gcp' || this.provider === 'azure') {
            const idle = this.computeInstances[this.provider][this.instanceType]['Min Watts'];
            const max = this.computeInstances[this.provider][this.instanceType]['Max Watts'];
            const x = [0, 100];
            const y: number[] = [idle, max];
            const spline = new Spline(x, y);
            wattage = spline.at(cpu) as number;
        }
        const energy = wattage * duration / 3600.0;
        return energy;
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
        aws_embodied.forEach((instance: { [key: string]: any }) => {
            this.computeInstances['aws'][instance['type']]['embodied'] = instance['total'];
        });
        gcp_embodied.forEach((instance: { [key: string]: any }) => {
            this.computeInstances['gcp'][instance['type']]['embodied'] = instance['total'];
        });
        azure_embodied.forEach((instance: { [key: string]: any }) => {
            this.computeInstances['azure'][instance['type']]['embodied'] = instance['total'];
        });
    }

    embodiedEmissions() {
        return this.computeInstances[this.provider][this.instanceType]['embodied'];
    }
}
