import { IOutputModelInterface } from '../interfaces';

import { CONFIG } from '../../config';

// import { KeyValuePair } from '../../types/common';

const { MODEL_IDS } = CONFIG;
const { AZURE_IMPORTER } = MODEL_IDS;

export class AzureImporterModel implements IImpactModelInterface {
    authParams: object | undefined = undefined;
    staticParams: object | undefined;
    name: string | undefined;

    authenticate(authParams: object): void {
        this.authParams = authParams;
    }

    /**
     * CONFIGURE NEEDS TO FIND ALL THE REQUEST PARAMS, INCL METRIC TYPE, AGGREGATION, INTERVAL
     *
     * PLAN TO ADD:
     *  AUTH() check env vars
     *  REQUEST()
     *  MARSHALL()
     *  as private functions to be called in calculate()
     *
     *  REQUEST() will have to pull some info from .env.local to authorize API request to Azure
     *  MARSHALL will have to parse json response and reorganize into yaml/observations
     */

    /**
     * Calculate the total emissions for a list of observations.
     *
     * Each Observation require:
     * @param {Object[]} observations
     */
    async calculate(observations: object | object[] | undefined): Promise<any[]> {
        if (observations === undefined) {
            observations = ['something', 'something else'];
            throw new Error('Required Parameters not provided');
        } else if (!Array.isArray(observations)) {
            throw new Error('Observations must be an array');
        }
        console.log('in here, doing the thing');
        return observations;

        // return observations.map((observation: KeyValuePair) => {
        //     if (!('grid-carbon-intensity' in observation)) {
        //         throw new Error('observation missing `grid-carbon-intensity`');
        //     }
        //     if (!('energy' in observation)) {
        //         throw new Error('observation missing `energy`');
        //     }
        //     this.configure(this.name!, observation);
        //     const grid_ci = parseFloat(observation['grid-carbon-intensity']);
        //     const energy = parseFloat(observation['energy']);
        //     observation['operational-carbon'] = grid_ci * energy;
        //     return observation;
        // });
    }

    async configure(
        name: string,
        staticParams: object | undefined
    ): Promise<IImpactModelInterface> {
        this.staticParams = staticParams;
        this.name = name;

        return this;
    }

    modelIdentifier(): string {
        return AZURE_IMPORTER;
    }
}
