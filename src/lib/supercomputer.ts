import {ModelsUniverse} from './models-universe';
import {Observatory} from './observatory';

import {ERRORS} from '../util/errors';

import {STRINGS} from '../config';

import {ChildInformation} from '../types/supercomputer';
import {Children, Config, Impl, ModelParams} from '../types/impl';

const {ImplValidationError} = ERRORS;

const {STRUCTURE_MALFORMED} = STRINGS;

/**
 * Computer for `impl` documents.
 */
export class Supercomputer {
  private olderChild: ChildInformation = {name: '', info: {}};
  private impl: Impl;
  private modelsHandbook: ModelsUniverse;

  constructor(impl: Impl, modelsHandbook: ModelsUniverse) {
    this.impl = impl;
    this.modelsHandbook = modelsHandbook;
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

  public aggregate() {
    let carbon = 0;
    let energy = 0;
    const subGraph = this.impl.graph.children.child;
    if (
      !('children' in subGraph) &&
      'outputs' in subGraph &&
      subGraph.outputs !== undefined
    ) {
      const outputs = subGraph.outputs;
      if (outputs !== undefined) {
        if (
          outputs[0]['carbon'] !== undefined &&
          typeof outputs[0]['carbon'] === 'string'
        ) {
          carbon += parseFloat(outputs[0]['carbon']);
        } else if (
          outputs[0]['carbon'] !== undefined &&
          typeof outputs[0]['carbon'] === 'number'
        )
          carbon += outputs[0]['carbon'];

        if (
          outputs[0]['energy'] !== undefined &&
          typeof outputs[0]['energy'] === 'string'
        ) {
          energy += parseFloat(outputs[0]['energy']);
        } else if (
          outputs[0]['energy'] !== undefined &&
          typeof outputs[0]['energy'] === 'number'
        )
          energy += outputs[0]['energy'];
      }
    } else {
      const childNames = Object.keys(subGraph.children ?? ['']);
      if (subGraph.children !== undefined) {
        for (const childName of childNames) {
          const outputs = subGraph.children[childName].outputs;
          if (outputs !== undefined) {
            if (
              outputs[0]['carbon'] !== undefined &&
              typeof outputs[0]['carbon'] === 'string'
            ) {
              carbon += parseFloat(outputs[0]['carbon']);
            } else if (
              outputs[0]['carbon'] !== undefined &&
              typeof outputs[0]['carbon'] === 'number'
            )
              carbon += outputs[0]['carbon'];

            if (
              outputs[0]['energy'] !== undefined &&
              typeof outputs[0]['energy'] === 'string'
            ) {
              energy += parseFloat(outputs[0]['energy']);
            } else if (
              outputs[0]['energy'] !== undefined &&
              typeof outputs[0]['energy'] === 'number'
            )
              energy += outputs[0]['energy'];
          }
        }
      }
    }
    Object.assign(this.impl, {
      'aggregated-inputs': {'total-energy': energy, 'total-carbon': carbon},
    });
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

    if (areChildrenNested) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.impl.graph.children[this.olderChild.name].children[
        childName
      ].outputs = observatory.getOutputs();

      return;
    }

    this.impl.graph.children[this.olderChild.name].outputs = outputs;
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
