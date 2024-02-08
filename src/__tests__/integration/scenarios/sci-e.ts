import {openYamlFileAsObject, saveYamlFileAs} from '../../../util/yaml';
import {Impl, hasInputs} from '../../../types/impl';
import {
  npmInstallPackage,
  npmUninstallPackage,
} from '../helpers/module-installer';
import {execPromise, getJSONFromText} from '../helpers/common';
import {sciEInputData} from '../test-data/sci-e';

describe('integration/sci-e', () => {
  const modelName = 'sci-e';
  const absoluteImplPath = `${__dirname}/../impls/sci-e.yaml`;
  const relativeImplPath = 'src/__tests__/integration/impls/sci-e.yaml';
  const implTemplatePath = `${__dirname}/../templates/integration.yaml`;

  beforeAll(() => {
    return npmInstallPackage('@grnsft/if-models');
  }, 15000);

  it('output creation without ompl path.', async () => {
    const file = await openYamlFileAsObject<Impl>(implTemplatePath);

    file.initialize.models[0].name = modelName;
    file.initialize.models[0].path = '@grnsft/if-models';
    file.initialize.models[0].model = 'SciEModel';
    file.graph.children.child.pipeline = [modelName];
    file.graph.children.child.config = {};
    file.graph.children.child.config[modelName] = {};

    if (hasInputs(file.graph.children.child)) {
      file.graph.children.child.inputs = sciEInputData['success-3-params'];
    }

    await saveYamlFileAs(file, absoluteImplPath); // save yaml uses absolute path
    const response = (
      await execPromise(`npm run impact-engine -- --impl ${relativeImplPath}`)
    ).stdout; // exec promise uses relative path

    const finalOmplParsed = getJSONFromText(response);

    // assertions
    if (
      hasInputs(finalOmplParsed.graph.children['child']) &&
      hasInputs(file.graph.children['child'])
    ) {
      const path = finalOmplParsed.graph.children['child'].outputs![0];
      const impPath = file.graph.children['child'].inputs[0];

      // assert timestamp
      expect(
        finalOmplParsed.graph.children['child'].inputs[0].timestamp
      ).toEqual(file.graph.children['child'].inputs[0].timestamp);

      // assert duration
      expect(
        finalOmplParsed.graph.children['child'].inputs[0].duration
      ).toEqual(file.graph.children['child'].inputs[0].duration);

      // assert total energy
      const sum =
        impPath['energy-cpu'] +
        impPath['energy-memory'] +
        impPath['energy-network'];

      expect(path.energy).toEqual(sum);
    }
  });

  afterAll(() => {
    return npmUninstallPackage('@grnsft/if-models');
  }, 15000);
});
