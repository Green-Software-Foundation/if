import {ModelsUniverse} from './models-universe';
import {Observatory} from './observatory';

import {ERRORS} from '../util/errors';

import {CONFIG, STRINGS} from '../config';

import {ChildInformation} from '../types/supercomputer';
import {Children, Config, Impl, ModelParams} from '../types/impl';
import {planetAggregator} from './planet-aggregator';
import {AggregationResult} from '../types/planet-aggregator';

const {ImplValidationError} = ERRORS;

const {AVERAGE_NAMES} = CONFIG;
const {STRUCTURE_MALFORMED} = STRINGS;

/**
 * Computer for `impl` documents.
 */
export class Supercomputer {
  private olderChild: ChildInformation = {name: '', info: {}};
  private impl: Impl;
  private modelsHandbook: ModelsUniverse;
  private aggregatedImpacts: AggregationResult[] = [];
  private childAmount = 0;

  constructor(impl: Impl, modelsHandbook: ModelsUniverse) {
    this.impl = impl;
    this.modelsHandbook = modelsHandbook;
  }

  /**
   * Goes through all aggregations collected from child components, then calculates the average.
   */
  public calculateAggregation() {
    const method = this.impl.aggregation['aggregation-method'];

    return this.aggregatedImpacts.reduce((acc, impact, index) => {
      const keys = Object.keys(impact);

      keys.forEach(key => {
        acc[key] = acc[key] ?? 0;
        acc[key] += impact[key];

        if (index === this.childAmount - 1) {
          if (AVERAGE_NAMES.includes(method)) {
            acc[key] /= this.childAmount;
          }
        }
      });

      return acc;
    }, {});
  }

  /**
   * Flattens config entries.
   */
  private flattenConfigValues(config: Config) {
    if (!config) {
      return {};
    }

    const configModelNames = Object.keys(config);
    const values = configModelNames.reduce((acc: any, name: string) => {
      acc = {
        ...acc,
        ...config[name],
      };

      return acc;
    }, {});

    return values;
  }

  /**
   * Adds config entries to each obsercation object passed.
   */
  private enrichInputs(
    inputs: ModelParams[],
    config: Config,
    nestedConfig: Config
  ) {
    const configValues = this.flattenConfigValues(config);
    const nestedConfigValues = this.flattenConfigValues(nestedConfig);

    return inputs.map((input: any) => ({
      ...input,
      ...configValues,
      ...nestedConfigValues,
    }));
  }

  /**
   * If child is top level, then initializes `this.olderChild`.
   * If `children` object contains `children` property, it means inputs are nested (calls compute again).
   * Otherwise enriches inputs, passes them to Observatory.
   * For each model from pipeline Observatory gathers inputs. Then results are stored.
   */
  private async calculateOutputsForChild(
    childrenObject: Children,
    params: any
  ) {
    const {childName, areChildrenNested} = params;

    if (!areChildrenNested) {
      this.olderChild = {
        name: childName,
        info: this.impl.graph.children[childName],
      };
    }

    const {pipeline, inputs, config} = this.olderChild.info;

    if ('children' in childrenObject[childName]) {
      return this.compute(childrenObject[childName].children);
    }

    if (!('inputs' in childrenObject[childName])) {
      throw new ImplValidationError(STRUCTURE_MALFORMED(childName));
    }

    this.childAmount++;

    const specificInputs = areChildrenNested
      ? childrenObject[childName].inputs
      : inputs;

    const childrenConfig = childrenObject[childName].config || {};

    const enrichedInputs = this.enrichInputs(
      specificInputs,
      config,
      childrenConfig
    );

    const observatory = new Observatory(enrichedInputs);

    for (const modelName of pipeline) {
      const params = config && config[modelName];
      const modelInstance = await this.modelsHandbook.getInitializedModel(
        modelName,
        params
      );

      await observatory.doInvestigationsWith(modelInstance);
    }

    const outputs = observatory.getOutputs();

    /**
     * If aggregation is required, then init `aggregated-outputs`.
     */
    if (this.impl.aggregation) {
      const aggregatedImpactsPerChild = planetAggregator(
        outputs,
        this.impl.aggregation
      );

      this.aggregatedImpacts.push(aggregatedImpactsPerChild);

      if (areChildrenNested) {
        this.impl.graph.children[this.olderChild.name].children[childName][
          'aggregated-outputs'
        ] = aggregatedImpactsPerChild;
      } else {
        this.impl.graph.children[this.olderChild.name]['aggregated-outputs'] =
          aggregatedImpactsPerChild;
      }
    }

    if (areChildrenNested) {
      this.impl.graph.children[this.olderChild.name].children[
        childName
      ].outputs = outputs;
    } else {
      this.impl.graph.children[this.olderChild.name].outputs = outputs;
    }

    return;
  }

  /**
   * Checks if object is top level children or nested, then runs through all children and calculates outputs.
   */
  public async compute(childrenObject?: any) {
    const implOrChildren = childrenObject || this.impl;
    const areChildrenNested = !!childrenObject;
    const children: Children = areChildrenNested
      ? implOrChildren
      : implOrChildren.graph.children;
    const childrenNames = Object.keys(children);

    for (const childName of childrenNames) {
      await this.calculateOutputsForChild(children, {
        childName,
        areChildrenNested,
      });
    }

    return this.impl;
  }
}
