import { ModelsUniverse } from './models-universe';
import { Observatory } from './observatory';

import { ChildInformation } from '../types/supercomputer';

/**
 * Computer for `impl` documents.
 */
export class Supercomputer {
  private olderChild: ChildInformation = { name: '', info: {} };
  private impl: any;
  private modelsHandbook: ModelsUniverse;

  constructor(impl: any, modelsHandbook: ModelsUniverse) {
    this.impl = impl;
    this.modelsHandbook = modelsHandbook;
  }

  /**
   * Flattens config entries.
   */
  private flattenConfigValues(config: any) {
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
  private enrichinputs(
    inputs: any[],
    config: any[],
    nestedConfig: any[]
  ) {
    const configValues = this.flattenConfigValues(config);
    const nestedConfigValues =
      nestedConfig && this.flattenConfigValues(nestedConfig);

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
  private async calculateoutputsForChild(childrenObject: any, params: any) {
    const { childName, areChildrenNested } = params;

    if (!areChildrenNested) {
      this.olderChild = {
        name: childName,
        info: this.impl.graph.children[childName],
      };
    }

    const { pipeline, inputs, config } = this.olderChild.info;

    if ('children' in childrenObject[childName]) {
      return this.compute(childrenObject[childName].children);
    }

    const specificinputs = areChildrenNested
      ? childrenObject[childName].inputs
      : inputs;

    const enrichedinputs = this.enrichinputs(
      specificinputs,
      config,
      childrenObject[childName].config
    );

    const observatory = new Observatory(enrichedinputs);

    for (const modelName of pipeline) {
      const params = config && config[modelName];
      const modelInstance = await this.modelsHandbook.getInitializedModel(
        modelName,
        params
      );

      await observatory.doInvestigationsWith(modelInstance);
    }

    if (areChildrenNested) {
      this.impl.graph.children[this.olderChild.name].children[
        childName
      ].outputs = observatory.getoutputs();

      return;
    }

    this.impl.graph.children[this.olderChild.name].outputs =
      observatory.getoutputs();
  }

  /**
   * Checks if object is top level children or nested, then runs through all children and calculates outputs.
   */
  public async compute(childrenObject?: any) {
    const implOrChildren = childrenObject || this.impl;
    const areChildrenNested = !!childrenObject;
    const children = areChildrenNested
      ? implOrChildren
      : implOrChildren.graph.children;
    const childrenNames = Object.keys(children);

    for (const childName of childrenNames) {
      await this.calculateoutputsForChild(children, {
        childName,
        areChildrenNested,
      });
    }

    return this.impl;
  }
}
