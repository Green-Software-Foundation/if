import {ModelsUniverse} from './models-universe';
import {Observatory} from './observatory';
import {planetAggregator} from './planet-aggregator';

import {ERRORS} from '../util/errors';

import {STRINGS} from '../config';

import {Children, Config, Impl} from '../types/impl';
import {ModelParams} from '../types/model-interface';
import {AggregationResult} from '../types/planet-aggregator';
import {ChildInformation} from '../types/supercomputer';

const {ImplValidationError} = ERRORS;

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
    if (!this.impl.aggregation) {
      throw new ImplValidationError('Aggregation params are not provided.');
    }

    const method = this.impl.aggregation['aggregation-method'];

    return this.aggregatedImpacts.reduce((acc, impact, index) => {
      const keys = Object.keys(impact);

      keys.forEach(key => {
        acc[key] = acc[key] ?? 0;
        acc[key] += impact[key];

        if (index === this.childAmount - 1) {
          if (method === 'avg') {
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
   * If `children` object contains `children` property, it means inputs are nested (calls computeChildren again).
   * Otherwise enriches inputs, passes them to Observatory.
   * For each model from pipeline Observatory gathers inputs. Then results are stored.
   */
  private async calculateOutputsForChild(
    childrenObject: Children,
    childName: string
  ) {
    const {pipeline, config: parentConfig} = this.olderChild.info;
    const childObject = childrenObject[childName];

    if ('children' in childObject) {
      return this.computeChildren(childObject.children);
    }

    if (!('inputs' in childObject)) {
      throw new ImplValidationError(STRUCTURE_MALFORMED(childName));
    }

    this.childAmount++;

    const enrichedInputs = this.enrichInputs(
      childObject.inputs,
      parentConfig,
      childObject.config
    );

    const observatory = new Observatory(enrichedInputs);

    for (const modelName of pipeline) {
      const params = parentConfig && parentConfig[modelName];
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

      childObject['aggregated-outputs'] = aggregatedImpactsPerChild;
    }

    childObject.outputs = outputs;

    return;
  }

  /**
   * Computes top level children, runs through each child and calculates outputs.
   * Initializes `this.olderChild` for each top-level child, to be used for all nested children calcucations.
   */
  public async compute() {
    const children = this.impl.graph.children;
    const childrenNames = Object.keys(children);

    for (const childName of childrenNames) {
      this.olderChild = {
        name: childName,
        info: children[childName],
      };
      await this.calculateOutputsForChild(children, childName);
    }

    return this.impl;
  }

  /**
   * Computes non-top level (nested) children.
   */

  private async computeChildren(children?: any) {
    const childrenNames = Object.keys(children);

    for (const childName of childrenNames) {
      await this.calculateOutputsForChild(children, childName);
    }

    return this.impl;
  }
}
