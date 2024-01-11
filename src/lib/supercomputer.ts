import {ModelsUniverse} from './models-universe';
import {Observatory} from './observatory';

import {ERRORS} from '../util/errors';

import {STRINGS} from '../config';

import {Children, Config, Impl} from '../types/impl';
import {ModelParams} from '../types/model-interface';
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
  private childAmount = 0;

  constructor(impl: Impl, modelsHandbook: ModelsUniverse) {
    this.impl = impl;
    this.modelsHandbook = modelsHandbook;
  }

  /**
   * Flattens config entries.
   */
  private flattenConfigValues(config: Config): ModelParams {
    if (config) {
      const configValues = Object.values(config);

      return configValues.reduce((acc, value) => ({...acc, ...value}), {});
    }

    return {};
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
    childName: string
  ) {
    const hasNestedChild = 'children' in childrenObject[childName];

    if (this.childAmount === 0) {
      this.olderChild = {
        name: childName,
        info: this.impl.graph.children[childName],
      };
    }

    this.childAmount++;

    if (hasNestedChild) {
      return this.compute(childrenObject[childName].children);
    }

    if (!('inputs' in childrenObject[childName])) {
      throw new ImplValidationError(STRUCTURE_MALFORMED(childName));
    }

    const {pipeline, config} = this.olderChild.info;
    const inputs = childrenObject[childName].inputs;

    const childrenConfig = childrenObject[childName].config || {};

    const enrichedInputs = this.enrichInputs(inputs, config, childrenConfig);

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

    childrenObject[childName].outputs = outputs;

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
