import { IImpactModelInterface } from '../interfaces';

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

    // async getAuth(){
    // ADD A FUNCTION TO GET THE NECESSARY AUTH FOR REQUESTING AZURE METRICS
    // DATA SUCH AS CLIENT-SECRET, RESOURCE-ID, TENTANT-ID etc SHOULD BE IN .ENV
    // USE "dotenv" LIB TO IMPORT
    //}

    // async fetchData() {
    // ADD A FUNCTION TO MAKE THE HTTP GET REQUEST THAT RETURNS CPU-UTIL AN TIMESTAMP
    // QUERY PARAMS WILL COME FROM IMPL AS STATICPARAMS
    // RETURNS JSON RESPONSE DATA
    //}

    // 

    /**
     * Calculate the total emissions for a list of observations.
     *
     * Each Observation require:
     * @param {Object[]} observations
     */
    async calculate(observations: object | object[] | undefined): Promise<any[]> {
        // IN HERE RECEIVE AZURE RESPONSE DATA AND REFORMAT FOR IMPL
        // INSERT INTO IMPL AS OBSERVATIONS

        if (observations === undefined) {
            observations = ['something', 'something else'];
            throw new Error('Required Parameters not provided');
        } else if (!Array.isArray(observations)) {
            throw new Error('Observations must be an array');
        }
        return observations
    };


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
