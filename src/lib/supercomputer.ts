import {ModelsUniverse} from './models-universe';
import {Observatory} from './observatory';
import {aggregate} from './aggregator';

import {ERRORS} from '../util/errors';

import {STRINGS} from '../config';

import {Children, ChildContent, Config, Impl} from '../types/impl';
import {ModelParams} from '../types/model-interface';

const {ImplValidationError} = ERRORS;

const {STRUCTURE_MALFORMED} = STRINGS;

/**
 * Computer for `impl` documents.
 */
export class Supercomputer {
  private parent!: ChildContent;
  private impl: Impl;
  private aggregatedValues: ModelParams[] = [];
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
   * If `children` object contains `children` property, it means inputs are nested (calls compute recursively).
   * Otherwise enriches inputs, passes them to Observatory.
   * For each model from pipeline Observatory gathers inputs. Then results are stored.
   */
  private async calculateOutputsFor(childen: Children, name: string) {
    const pointedChild = childen[name];
    const itHasChildren = 'children' in pointedChild;
    const itHasInputs = 'inputs' in pointedChild;

    if (itHasChildren) {
      return this.compute(pointedChild.children);
    }

    if (!(itHasChildren || itHasInputs)) {
      throw new ImplValidationError(STRUCTURE_MALFORMED(name));
    }

    this.childAmount++;

    const {pipeline} = this.parent;
    const {inputs, config} = pointedChild;

    const enrichedInputs = this.enrichInputs(inputs, {
      ...this.parent.config,
      ...config,
    });
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
    pointedChild.outputs = outputs;

    /** If aggregation is enabled, do horizontal aggregation. */
    if (this.impl.aggregation) {
      const {type, metrics} = this.impl.aggregation;

      if (type === 'horizontal' || type === 'both') {
        const aggregation = await aggregate(outputs, metrics);
        pointedChild['aggregated-outputs'] = aggregation;

        this.aggregatedValues.push(aggregation);
      }
    }

    return;
  }

  /**
   * Checks if children argument is present.
   * If it's not, then iteration is on parent level so stores the parent.
   * Otherwise iterates over child components.
   */
  public async compute(children?: Children) {
    const pointedChildren = children || this.impl.graph.children;
    const childrensNames = Object.keys(pointedChildren);

    for (const name of childrensNames) {
      if (!children) {
        this.parent = pointedChildren[name];
      }

      await this.calculateOutputsFor(pointedChildren, name);
    }

    return this.impl;
  }
}
