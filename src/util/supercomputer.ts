import {ModelsUniverse} from './models-universe';
import {Observatory} from './observatory';

import {ChildInformation} from '../types/supercomputer';

/**
 * Computer for `impl` documents.
 */
export class Supercomputer {
  private olderChild: ChildInformation = {name: '', info: {}};
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
  private enrichObservations(observations: any[], config: any[]) {
    const configValues = this.flattenConfigValues(config);

    return observations.map((observation: any) => ({
      ...observation,
      ...configValues,
    }));
  }

  /**
   * If child is top level, then initializes `this.olderChild`.
   * If `children` object contains `children` property, it means observations are nested (calls compute again).
   * Otherwise enriches observations, passes them to Observatory.
   * For each model from pipeline Observatory gathers observations. Then results are stored.
   */
  private async calculateImpactsForChild(childrenObject: any, params: any) {
    const {childName, areChildrenNested} = params;

    if (!areChildrenNested) {
      this.olderChild = {
        name: childName,
        info: this.impl.graph.children[childName],
      };
    }

    const {pipeline, observations, config} = this.olderChild.info;

    if ('children' in childrenObject[childName]) {
      return this.compute(childrenObject[childName].children, {
        config,
      });
    }

    const specificObservations = areChildrenNested
      ? childrenObject[childName].observations
      : observations;

    const enrichedObservations = this.enrichObservations(
      specificObservations,
      config
    );

    const observatory = new Observatory(enrichedObservations);

    for (const modelName of pipeline) {
      const params = config && config[modelName];
      const modelInstance = await this.modelsHandbook.getInitializedModel(
        modelName,
        params
      );

      await observatory.doInvestigationsWith(modelInstance);

      if (areChildrenNested) {
        this.impl.graph.children[this.olderChild.name].children[
          childName
        ].impacts = observatory.getImpacts();

        return;
      }
    }

    this.impl.graph.children[this.olderChild.name].impacts =
      observatory.getImpacts();
  }

  /**
   * Checks if object is top level children or nested, then runs through all children and calculates impacts.
   */
  public async compute(childrenObject?: any, params?: any) {
    const implOrChildren = childrenObject || this.impl;
    const areChildrenNested = !!childrenObject;
    const children = areChildrenNested
      ? implOrChildren
      : implOrChildren.graph.children;
    const childrenNames = Object.keys(children);

    for (const childName of childrenNames) {
      await this.calculateImpactsForChild(children, {
        childName,
        areChildrenNested,
        ...params,
      });
    }

    return this.impl;
  }
}
