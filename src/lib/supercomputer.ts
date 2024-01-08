import {ModelsUniverse} from './models-universe';
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
   * If child is top level, then initializes `this.olderChild`.
   * If `children` object contains `children` property, it means inputs are nested (calls compute again).
   * For each model from pipeline Observatory gathers inputs, providing output from previous models
   * in the pipeline to the next ones. Then results are stored.
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

    const inputsCopy = specificInputs.map((input: any) => ({...input}));

    const childrenConfig = childrenObject[childName].config || {};

    const outputs = await pipeline.reduce(
      async (acc: ModelParams[], modelName: string) => {
        const parentModelConfig = (config && config[modelName]) || {};
        const currentNodeModelConfig = childrenConfig[modelName] || {};
        const mergedModelConfig: Config = {
          ...parentModelConfig,
          ...currentNodeModelConfig,
        };

        const modelInstance = await this.modelsHandbook.getInitializedModel(
          modelName,
          mergedModelConfig
        );
        return await modelInstance.execute(await acc, mergedModelConfig);
      },
      inputsCopy
    );

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
