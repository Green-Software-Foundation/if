import {ModelsUniverse} from './models-universe';
import {Observatory} from './observatory';
import {aggregate} from './aggregator';

import {ERRORS} from '../util/errors';

import {STRINGS} from '../config';

import {Children, ChildrenContent, Config, Impl} from '../types/impl';
import {ModelParams} from '../types/model-interface';

const {ImplValidationError} = ERRORS;

const {STRUCTURE_MALFORMED} = STRINGS;

/**
 * Computer for `impl` documents.
 */
export class Supercomputer {
  private parent!: ChildrenContent;
  private impl: Impl;
  private modelsHandbook: ModelsUniverse;
  private childAmount = 0;

  constructor(impl: Impl, modelsHandbook: ModelsUniverse) {
    this.impl = impl;
    this.modelsHandbook = modelsHandbook;
  }

  /**
   * Flattens config entries.
   */
  private flattenConfigValues(config: Config): ModelParams {
    const configValues = Object.values(config);

    return configValues.reduce((acc, value) => ({...acc, ...value}), {});
  }

  /**
   * Adds config entries to each obsercation object passed.
   */
  private enrichInputs(inputs: ModelParams[], config: Config) {
    const configValues = this.flattenConfigValues(config);

    return inputs.map((input: any) => ({
      ...input,
      ...configValues,
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
    childName: string
  ) {
    if (this.childAmount === 0) {
      this.parent = this.impl.graph.children[childName];
    }

    this.childAmount++;

    if ('children' in childrenObject[childName]) {
      await this.compute(childrenObject[childName].children);
    }

    if (!('inputs' in childrenObject[childName])) {
      throw new ImplValidationError(STRUCTURE_MALFORMED(childName));
    }

    const {pipeline, config} = this.parent;
    const {inputs} = childrenObject[childName];

    const childConfig = childrenObject[childName].config;
    const enrichedInputs = this.enrichInputs(inputs, {
      ...config,
      ...childConfig,
    });
    const observatory = new Observatory(enrichedInputs);

    for (const modelName of pipeline) {
      const params = childConfig && childConfig[modelName];
      const modelInstance = await this.modelsHandbook.getInitializedModel(
        modelName,
        params
      );

      await observatory.doInvestigationsWith(modelInstance);
    }

    const outputs = observatory.getOutputs();
    childrenObject[childName].outputs = outputs;

    /** If aggregation is enabled, do horizontal aggregation. */
    if (this.impl.aggregation) {
      if (
        this.impl.aggregation.type === 'horizontal' ||
        this.impl.aggregation.type === 'both'
      ) {
        const aggregation = await aggregate(
          outputs,
          this.impl.aggregation.metrics
        );

        childrenObject[childName]['aggregated-outputs'] = aggregation;
      }
    }

    return;
  }

  /**
   * Checks if object is top level children or nested, then runs through all children and calculates outputs.
   */
  public async compute(childrenObject?: any) {
    const children = childrenObject || this.impl.graph.children;
    const childrenNames = Object.keys(children);

    for (const childName of childrenNames) {
      await this.calculateOutputsForChild(children, childName);
    }

    return this.impl;
  }
}
