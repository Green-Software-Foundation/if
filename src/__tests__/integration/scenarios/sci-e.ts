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
  const absoluteImplPath = `${__dirname}/../manifest/sci-e.yaml`;
  const relativeImplPath = 'src/__tests__/integration/manifest/sci-e.yaml';
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

    await saveYamlFileAs(file, absoluteImplPath); // save yaml uses absolute path
    const response = (
      await execPromise(`npm run if -- --manifest ${relativeImplPath}`)
    ).stdout; // exec promise uses relative path

    const finalOmplParsed = getJSONFromText(response);

    // assertions
    const path = finalOmplParsed.tree.children['child'].outputs![0];
    const impPath = file.tree.children['child'].inputs[0];

    // assert timestamp
    expect(finalOmplParsed.tree.children['child'].inputs[0].timestamp).toEqual(
      file.tree.children['child'].inputs[0].timestamp
    );

    // assert duration
    expect(finalOmplParsed.tree.children['child'].inputs[0].duration).toEqual(
      file.tree.children['child'].inputs[0].duration
    );

    // assert total energy
    const sum =
      impPath['cpu/energy'] +
      impPath['memory/energy'] +
      impPath['network/energy'];

    expect(path.energy).toEqual(sum);
  });

  //after
  afterAll(() => {
    return npmUninstallPackage('@grnsft/if-models');
  }, 15000);
});
