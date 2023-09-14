import {ModelsUniverse} from './models-universe';
import {Observatory} from './observatory';

/**
 * Flattens config entries.
 */
export const flattenConfigValues = (config: any) => {
  const configModelNames = Object.keys(config);
  const values = configModelNames.reduce((acc: any, name: string) => {
    acc = {
      ...acc,
      ...config[name],
    };

    return acc;
  }, {});

  return values;
};

/**
 * For each graph builds params, then passes it to computing fn.
 * Appends model config to each observation, then passes that information to Observatory.
 * Then starts doing investigations for each model from pipeline.
 * Grabs the result and returns it.
 */
export const calculateImpactsBasedOnGraph =
  (impl: any, modelsHandbook: ModelsUniverse) =>
  async (childrenName: string) => {
    const child = impl.graph.children[childrenName];
    const {pipeline, observations, config} = child;

    const extendedObservations = observations.map((observation: any) => ({
      ...observation,
      ...flattenConfigValues(config),
    }));

    const observatory = new Observatory(extendedObservations);

    for (const modelName of pipeline) {
      const modelInstance: any = await modelsHandbook.initalizedModels[
        modelName
      ](config && config[modelName]);

      await observatory.doInvestigationsWith(modelInstance);
    }

    const impacts = observatory.getImpacts();
    impl.graph.children[childrenName].impacts = impacts;

    return impl;
  };
