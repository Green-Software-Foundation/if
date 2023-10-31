import axios from 'axios';

import {IOutputModelInterface} from '../interfaces';
import {CONFIG} from '../../config';

import {BoaviztaInstanceTypes, IBoaviztaUsageSCI} from '../../types/boavizta';
import {KeyValuePair} from '../../types/common';

const {MODEL_IDS} = CONFIG;
const {BOAVIZTA_CPU, BOAVIZTA_CLOUD} = MODEL_IDS;

abstract class BoaviztaOutputModel implements IOutputModelInterface {
  name: string | undefined;
  sharedParams: object | undefined = undefined;
  metricType: 'cpu-util' | 'gpu-util' | 'ram-util' = 'cpu-util';
  expectedLifespan = 4 * 365 * 24 * 60 * 60;
  protected authCredentials: object | undefined;

  async authenticate(authParams: object) {
    this.authCredentials = authParams;
  }

  async configure(
    name: string,
    staticParams: object | undefined = undefined
  ): Promise<IOutputModelInterface> {
    this.name = name;
    this.sharedParams = await this.captureStaticParams(staticParams ?? {});
    return this;
  }

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

  // converts the usage from IMPL input to the format required by Boavizta API.
  transformToBoaviztaUsage(duration: number, metric: number) {
    // duration is in seconds, convert to hours
    // metric is between 0 and 1, convert to percentage
    let usageInput: KeyValuePair = {
      hours_use_time: duration / 3600.0,
      time_workload: metric,
    };
    // convert expected lifespan from seconds to years
    usageInput['years_life_time'] =
      this.expectedLifespan / (365.0 * 24.0 * 60.0 * 60.0);
    usageInput = this.addLocationToUsage(usageInput);

    return usageInput;
  }

  // Calculates the output of the given usage
  async execute(
    inputs: object | object[] | undefined = undefined
  ): Promise<any[]> {
    if (Array.isArray(inputs)) {
      const results: KeyValuePair[] = [];

      for (const input of inputs) {
        const usageResult = await this.calculateUsageForinput(input);
        results.push(usageResult);
      }

      return results;
    } else {
      throw new Error(
        'Parameter Not Given: invalid inputs parameter. Expecting an array of inputs'
      );
    }
  }

  // Adds location to usage if location is defined in sharedParams
  addLocationToUsage(usageRaw: KeyValuePair) {
    if (this.sharedParams !== undefined && 'location' in this.sharedParams) {
      usageRaw['usage_location'] = this.sharedParams['location'];
    }

    return usageRaw;
  }

  //abstract subs to make compatibility with base interface. allows configure to be defined in base class
  protected abstract captureStaticParams(staticParams: object): object;

  // extracts information from Boavizta API response to return the output in the format required by IMPL
  protected formatResponse(data: KeyValuePair): KeyValuePair {
    let m = 0;
    let e = 0;
    if ('outputs' in data) {
      // embodied-carbon output is in kgCO2eq, convert to gCO2eq
      m = data['outputs']['gwp']['embedded']['value'] * 1000;
      // use output is in J , convert to kWh.
      // 1,000,000 J / 3600 = 277.7777777777778 Wh.
      // 1 MJ / 3.6 = 0.278 kWh
      e = data['outputs']['pe']['use']['value'] / 3.6;
    } else if ('gwp' in data && 'pe' in data) {
      // embodied-carbon output is in kgCO2eq, convert to gCO2eq
      m = data['gwp']['embodied-carbon'] * 1000;
      // use output is in J , convert to kWh.
      // 1,000,000 J / 3600 = 277.7777777777778 Wh.
      // 1 MJ / 3.6 = 0.278 kWh
      e = data['pe']['use'] / 3.6;
    }

    return {'embodied-carbon': m, energy: e};
  }

  // converts the usage to the format required by Boavizta API.
  protected async calculateUsageForinput(
    input: KeyValuePair
  ): Promise<KeyValuePair> {
    if (
      'timestamp' in input &&
      'duration' in input &&
      this.metricType in input
    ) {
      const usageInput = this.transformToBoaviztaUsage(
        input['duration'],
        input[this.metricType]
      );
      const usage = (await this.fetchData(usageInput)) as IBoaviztaUsageSCI;

      return usage;
    } else {
      throw new Error('Invalid Input: Invalid inputs parameter');
    }
  }
}

export class BoaviztaCpuOutputModel
  extends BoaviztaOutputModel
  implements IOutputModelInterface
{
  sharedParams: object | undefined = undefined;
  public name: string | undefined;
  public verbose = false;
  public allocation = 'LINEAR';
  private readonly componentType = 'cpu';

  constructor() {
    super();
    this.metricType = 'cpu-util';
    this.componentType = 'cpu';
  }

  modelIdentifier(): string {
    return BOAVIZTA_CPU;
  }

  async fetchData(usageData: object | undefined): Promise<object> {
    if (this.sharedParams === undefined) {
      throw new Error('Improper configure: Missing configuration parameters');
    }

    const dataCast = this.sharedParams as KeyValuePair;
    dataCast['usage'] = usageData;

    const response = await axios.post(
      `https://api.boavizta.org/v1/component/${this.componentType}?verbose=${this.verbose}&duration=${dataCast['usage']['hours_use_time']}`,
      dataCast
    );

    const result = this.formatResponse(response.data);

    // console.log(
    //   'hitting ',
    //   `https://api.boavizta.org/v1/component/${this.componentType}?verbose=${this.verbose}&duration=${dataCast['usage']['hours_use_time']}`,
    //   dataCast,
    //   JSON.stringify(response.data)
    // );
    return {
      'e-cpu': result.energy,
      'embodied-carbon': result['embodied-carbon'],
    };
  }

  protected async captureStaticParams(staticParams: object): Promise<object> {
    if ('verbose' in staticParams) {
      this.verbose = (staticParams.verbose as boolean) ?? false;
      staticParams.verbose = undefined;
    }

    if (!('physical-processor' in staticParams)) {
      throw new Error('Improper configure: Missing processor parameter');
    }

    if (!('core-units' in staticParams)) {
      throw new Error('Improper configure: Missing core-units parameter');
    }

    if ('expected-lifespan' in staticParams) {
      this.expectedLifespan = staticParams['expected-lifespan'] as number;
    }
    this.sharedParams = Object.assign({}, staticParams);

    return this.sharedParams;
  }
}

export class BoaviztaCloudOutputModel
  extends BoaviztaOutputModel
  implements IOutputModelInterface
{
  public sharedParams: object | undefined = undefined;
  public instanceTypes: BoaviztaInstanceTypes = {};
  public name: string | undefined;
  public verbose = false;
  public allocation = 'LINEAR';

  modelIdentifier(): string {
    return BOAVIZTA_CLOUD;
  }

  async validateLocation(staticParamsCast: object): Promise<string | void> {
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
      return staticParamsCast.location as string;
    }
  }

  async validateInstanceType(staticParamsCast: object) {
    if (!('provider' in staticParamsCast)) {
      throw new Error('Improper configure: Missing provider parameter');
    }

    if (!('instance-type' in staticParamsCast)) {
      throw new Error("Improper configure: Missing 'instance-type' parameter");
    }

    const provider = staticParamsCast.provider as string;

    if (
      this.instanceTypes[provider] === undefined ||
      this.instanceTypes[provider].length === 0
    ) {
      this.instanceTypes[provider] = await this.supportedInstancesList(
        provider
      );
    }

    if ('instance-type' in staticParamsCast) {
      if (
        !this.instanceTypes[provider].includes(
          staticParamsCast['instance-type'] as string
        )
      ) {
        throw new Error(
          `Improper configure: Invalid 'instance-type' parameter: '${
            staticParamsCast['instance-type']
          }'. Valid values are : ${this.instanceTypes[provider].join(', ')}`
        );
      }
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
      `https://api.boavizta.org/v1/cloud/instance/all_instances?provider=${provider}`
    );

    return instances.data;
  }

  async supportedProvidersList(): Promise<string[]> {
    const providers = await axios.get(
      'https://api.boavizta.org/v1/cloud/instance/all_providers'
    );

    return Object.values(providers.data);
  }

  async fetchData(usageData: object | undefined): Promise<object> {
    if (this.sharedParams === undefined) {
      throw new Error('Improper configure: Missing configuration parameters');
    }

    const dataCast = this.sharedParams as KeyValuePair;
    for (const key in dataCast) {
      //   replace - with _ in keys
      if (key.includes('-')) {
        const newKey = key.replace(/-/g, '_');
        dataCast[newKey] = dataCast[key];
        delete dataCast[key];
      }
    }
    dataCast['usage'] = usageData;
    const response = await axios.post(
      `https://api.boavizta.org/v1/cloud/instance?verbose=${this.verbose}&duration=${dataCast['usage']['hours_use_time']}`,
      dataCast
    );
    // console.log(
    //   `https://api.boavizta.org/v1/cloud/instance?verbose=${this.verbose}&duration=${dataCast['usage']['hours_use_time']}`,
    //   JSON.stringify(response.data),
    //   dataCast
    // );

    return this.formatResponse(response.data);
  }

  protected async captureStaticParams(staticParams: object) {
    if ('verbose' in staticParams) {
      this.verbose = (staticParams.verbose as boolean) ?? false;
      staticParams.verbose = undefined;
    }
    // if no valid provider found, throw error
    await this.validateProvider(staticParams);
    // if no valid 'instance-type' found, throw error
    await this.validateInstanceType(staticParams);
    // if no valid location found, throw error
    await this.validateLocation(staticParams);

    if ('expected-lifespan' in staticParams) {
      this.expectedLifespan = staticParams['expected-lifespan'] as number;
    }

    this.sharedParams = Object.assign({}, staticParams);

    return this.sharedParams;
  }
}

/**
 * For JSII.
 */
export {IOutputModelInterface} from '../interfaces';
export {BoaviztaInstanceTypes, IBoaviztaUsageSCI} from '../../types/boavizta';
export {KeyValuePair} from '../../types/common';
