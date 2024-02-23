import {openYamlFileAsObject, saveYamlFileAs} from '../../../util/yaml';
import {Manifest} from '../../../types/manifest';
import {
  npmInstallPackage,
  npmUninstallPackage,
} from '../helpers/module-installer';
import {execPromise, getJSONFromText} from '../helpers/common';
import {sciEInputData} from '../test-data/sci-e';

describe('integration/sci-e', () => {
  const modelName = 'sci-e';
  const absoluteManifestPath = `${__dirname}/../manifest/sci-e.yaml`;
  const relativeManifestPath = 'src/__tests__/integration/manifest/sci-e.yaml';
  const implTemplatePath = `${__dirname}/../templates/integration.yaml`;

  beforeAll(() => {
    return npmInstallPackage('@grnsft/if-models');
  }, 15000);

  it('output creation without ompl path.', async () => {
    const file = await openYamlFileAsObject<Manifest>(implTemplatePath);

    file.initialize.plugins[modelName] = {
      method: 'SciE',
      path: '@grnsft/if-models',
    };

    file.tree.children.child.pipeline = [modelName];
    file.tree.children.child.config = {};
    file.tree.children.child.config[modelName] = {};
    file.tree.children.child.inputs = sciEInputData['success-3-params'];

    await saveYamlFileAs(file, absoluteManifestPath); // save yaml uses absolute path
    const response = (
      await execPromise(`npm run if -- --manifest ${relativeManifestPath}`)
    ).stdout; // exec promise uses relative path

    const finalOutputParsed = getJSONFromText(response);

    // assertions
    const path = finalOutputParsed.tree.children['child'].outputs![0];
    const manifestPath = file.tree.children['child'].inputs[0];

    // assert timestamp
    expect(
      finalOutputParsed.tree.children['child'].inputs[0].timestamp
    ).toEqual(file.tree.children['child'].inputs[0].timestamp);

    // assert duration
    expect(finalOutputParsed.tree.children['child'].inputs[0].duration).toEqual(
      file.tree.children['child'].inputs[0].duration
    );

    // assert total energy
    const sum =
      manifestPath['cpu/energy'] +
      manifestPath['memory/energy'] +
      manifestPath['network/energy'];

    expect(path.energy).toEqual(sum);
  });

  afterAll(() => {
    return npmUninstallPackage('@grnsft/if-models');
  }, 15000);
});
