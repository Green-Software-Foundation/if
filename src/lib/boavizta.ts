import axios from 'axios';

import {IImpactModelInterface} from './interfaces';
export {IImpactModelInterface} from './interfaces';
import {CONFIG} from '../config';

import {
  BoaviztaInstanceTypes,
  IBoaviztaUsageSCI,
  KeyValuePair,
} from '../types/boavizta';
export {
  BoaviztaInstanceTypes,
  IBoaviztaUsageSCI,
  KeyValuePair,
} from '../types/boavizta';

const {BOAVIZTA} = CONFIG;
const {CPU_IMPACT_MODEL_ID, CLOUD_IMPACT_MODEL_ID} = BOAVIZTA;

abstract class BoaviztaImpactModel implements IImpactModelInterface {
  protected authCredentials: object | undefined;
  name: string | undefined;
  sharedParams: object | undefined = undefined;
  metricType: 'cpu' | 'gpu' | 'ram' = 'cpu';

  authenticate(authParams: object) {
    this.authCredentials = authParams;
  }

  async configure(
    name: string,
    staticParams: object | undefined = undefined
  ): Promise<IImpactModelInterface> {
    this.name = name;
    this.sharedParams = await this.captureStaticParams(staticParams ?? {});
    return this;
  }

  //abstract subs to make compatibility with base interface. allows configure to be defined in base class
  protected abstract captureStaticParams(staticParams: object): any;

  //defines the model identifier
  abstract modelIdentifier(): string;

  //fetches data from Boavizta API according to the specific endpoint of the model
  abstract fetchData(usageData: object | undefined): Promise<object>;

  // list of supported locations by the model
  async supportedLocations(): Promise<string[]> {
    const countries = await axios.get(
      'https://api.boavizta.org/v1/utils/country_code'
    );
    return Object.values(countries.data);
  }

  // extracts information from Boavizta API response to return the impact in the format required by IMPL
  protected formatResponse(response: any): {[p: string]: any} {
    let m = 0;
    let e = 0;

    if ('impacts' in response.data) {
      // manufacture impact is in kgCO2eq, convert to gCO2eq
      m = response.data['impacts']['gwp']['manufacture'] * 1000;
      // use impact is in J , convert to kWh.
      // 1,000,000 J / 3600 = 277.7777777777778 Wh.
      // 1 MJ / 3.6 = 0.278 kWh
      e = response.data['impacts']['pe']['use'] / 3.6;
    } else if ('gwp' in response.data && 'pe' in response.data) {
      // manufacture impact is in kgCO2eq, convert to gCO2eq
      m = response.data['gwp']['manufacture'] * 1000;
      // use impact is in J , convert to kWh.
      // 1,000,000 J / 3600 = 277.7777777777778 Wh.
      // 1 MJ / 3.6 = 0.278 kWh
      e = response.data['pe']['use'] / 3.6;
    }

    return {m, e};
  }

  // converts the usage from IMPL input to the format required by Boavizta API.
  transformToBoaviztaUsage(duration: any, metric: any) {
    // duration is in seconds, convert to hours
    // metric is between 0 and 1, convert to percentage
    let usageInput: KeyValuePair = {
      hours_use_time: duration / 3600.0,
      time_workload: metric * 100.0,
    };
    usageInput = this.addLocationToUsage(usageInput);

    return usageInput;
  }

  // Calculates the impact of the given usage
  async calculate(
    observations: object | object[] | undefined = undefined
  ): Promise<object> {
    if (Array.isArray(observations)) {
      const results = [];
      for (const observation of observations) {
        const usageResult =
          await this.calculateUsageForObservation(observation);
        results.push(usageResult);
      }
      return results;
    } else {
      throw new Error(
        'Parameter Not Given: invalid observations parameter. Expecting an array of observations'
      );
    }
  }

  // converts the usage to the format required by Boavizta API.
  protected async calculateUsageForObservation(observation: KeyValuePair) {
    if (
      'datetime' in observation &&
      'duration' in observation &&
      this.metricType in observation
    ) {
      const usageInput = this.transformToBoaviztaUsage(
        observation['duration'],
        observation[this.metricType]
      );
      return (await this.fetchData(usageInput)) as IBoaviztaUsageSCI;
    } else {
      throw new Error('Invalid Input: Invalid observations parameter');
    }
  }

  // Adds location to usage if location is defined in sharedParams
  addLocationToUsage(usageRaw: KeyValuePair) {
    if (this.sharedParams !== undefined && 'location' in this.sharedParams) {
      usageRaw['usage_location'] = this.sharedParams['location'];
    }

    return usageRaw;
  }
}

export class BoaviztaCpuImpactModel
  extends BoaviztaImpactModel
  implements IImpactModelInterface
{
  private readonly componentType = 'cpu';
  sharedParams: object | undefined = undefined;
  public name: string | undefined;
  public verbose = false;
  public allocation = 'LINEAR';

  constructor() {
    super();
    this.metricType = 'cpu';
    this.componentType = 'cpu';
  }

  modelIdentifier(): string {
    return CPU_IMPACT_MODEL_ID;
  }

  protected async captureStaticParams(staticParams: object): Promise<object> {
    if ('verbose' in staticParams) {
      this.verbose = (staticParams.verbose as boolean) ?? false;
      staticParams.verbose = undefined;
    }

    if (!('name' in staticParams)) {
      throw new Error('Improper configure: Missing name parameter');
    }

    if (!('core_units' in staticParams)) {
      throw new Error('Improper configure: Missing core_units parameter');
    }

    this.sharedParams = Object.assign({}, staticParams);

    return this.sharedParams;
  }

  async fetchData(usageData: object | undefined): Promise<object> {
    if (this.sharedParams === undefined) {
      throw new Error('Improper configure: Missing configuration parameters');
    }

    const dataCast = this.sharedParams as KeyValuePair;
    dataCast['usage'] = usageData;
    const response = await axios.post(
      `https://api.boavizta.org/v1/component/${this.componentType}?verbose=${this.verbose}&allocation=${this.allocation}`,
      dataCast
    );

    return this.formatResponse(response);
  }
}

export class BoaviztaCloudImpactModel
  extends BoaviztaImpactModel
  implements IImpactModelInterface
{
  public sharedParams: object | undefined = undefined;
  public instanceTypes: BoaviztaInstanceTypes = {};
  public name: string | undefined;
  public verbose = false;
  public allocation = 'LINEAR';

  modelIdentifier(): string {
    return CLOUD_IMPACT_MODEL_ID;
  }

  protected async captureStaticParams(staticParams: object) {
    if ('verbose' in staticParams) {
      this.verbose = (staticParams.verbose as boolean) ?? false;
      staticParams.verbose = undefined;
    }
    // if no valid provider found, throw error
    await this.validateProvider(staticParams);
    // if no valid instance_type found, throw error
    await this.validateInstanceType(staticParams);
    // if no valid location found, throw error
    await this.validateLocation(staticParams);
    this.sharedParams = Object.assign({}, staticParams);

    return this.sharedParams;
  }

  async validateLocation(staticParamsCast: object) {
    if ('location' in staticParamsCast) {
      const location = (staticParamsCast.location as string) ?? 'USA';
      const countries = await this.supportedLocations();
      if (!countries.includes(location)) {
        throw new Error(
          "Improper configure: Invalid location parameter: '" +
            location +
            "'. Valid values are : " +
            countries.join(', ')
        );
      }
    }
  }

  async validateInstanceType(staticParamsCast: object) {
    if (!('instance_type' in staticParamsCast)) {
      throw new Error('Improper configure: Missing instance_type parameter');
    }

    if (!('provider' in staticParamsCast)) {
      throw new Error('Improper configure: Missing provider parameter');
    }

    const provider = staticParamsCast.provider as string;

    if (
      this.instanceTypes[provider] === undefined ||
      this.instanceTypes[provider].length === 0
    ) {
      this.instanceTypes[provider] =
        await this.supportedInstancesList(provider);
    }

    if ('instance_type' in staticParamsCast) {
      if (
        !this.instanceTypes[provider].includes(
          staticParamsCast.instance_type as string
        )
      ) {
        throw new Error(
          "Improper configure: Invalid instance_type parameter: '" +
            staticParamsCast.instance_type +
            "'. Valid values are : " +
            this.instanceTypes[provider].join(', ')
        );
      }
    } else {
      throw new Error('Improper configure: Missing instance_type parameter');
    }
  }

  async validateProvider(staticParamsCast: object) {
    if (!('provider' in staticParamsCast)) {
      throw new Error('Improper configure: Missing provider parameter');
    } else {
      const supportedProviders = await this.supportedProvidersList();

      if (!supportedProviders.includes(staticParamsCast.provider as string)) {
        throw new Error(
          "Improper configure: Invalid provider parameter: '" +
            staticParamsCast.provider +
            "'. Valid values are : " +
            supportedProviders.join(', ')
        );
      }
    }
  }

  async supportedInstancesList(provider: string) {
    const instances = await axios.get(
      `https://api.boavizta.org/v1/cloud/all_instances?provider=${provider}`
    );

    return instances.data;
  }

  async supportedProvidersList(): Promise<string[]> {
    const providers = await axios.get(
      'https://api.boavizta.org/v1/cloud/all_providers'
    );

    return Object.values(providers.data);
  }

  async fetchData(usageData: object | undefined): Promise<object> {
    if (this.sharedParams === undefined) {
      throw new Error('Improper configure: Missing configuration parameters');
    }

    const dataCast = this.sharedParams as KeyValuePair;
    dataCast['usage'] = usageData;
    const response = await axios.post(
      `https://api.boavizta.org/v1/cloud/?verbose=${this.verbose}&allocation=${this.allocation}`,
      dataCast
    );

    return this.formatResponse(response);
  }
}
