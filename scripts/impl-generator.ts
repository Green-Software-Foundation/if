import * as yaml from 'js-yaml';
import * as fs from 'fs';

const frontmatter =
  'name: nesting-demo\ndescription:\ntags:\nkind:\ninitialize:\n  models:\n';
const models = ['teads-curve', 'sci-e', 'sci-m', 'sci-o', 'sci'];
const classes = [
  'TeadsCurveModel',
  'SciEModel',
  'SciEModel',
  'SciOModel',
  'SciModel',
];
const config =
  '      config:\n        teads-curve:\n          thermal-design-power: 65\n';
const configSciM =
  '        sci-m:\n          total-embodied-emissions: 251000\n          time-reserved: 3600\n          expected-lifespan: 126144000\n          resources-reserved: 1\n          total-resources: 1\n';
const configSciO = '        sci-o:\n          grid-carbon-intensity: 457\n';
const configSci =
  '        sci:\n          functional-unit-duration: 1\n          functional-duration-time:\n          functional-unit:\n';
const children = '      children: \n';
let inputData = '';
let pipeline = '';
let child = '';
const n_nodes = 1000;
const n_timestamps = 50;

let graph = 'graph:\n  children:\n    child:\n      pipeline:\n';
for (let i = 0; i < models.length; i++) {
  let path = '';
  if (models[i].includes('sci')) {
    path = '@grnsft/if-models';
  } else {
    path = '@grnsft/if-unofficial-models';
  }
  pipeline =
    pipeline +
    `    - name: ${models[i]}\n      model: ${classes[i]}\n      path: "${path}"\n`;
  graph = graph + `        - ${models[i]}\n`;
}

for (let i: any = 0; i <= n_nodes; i++) {
  child = `         child-${i}:\n           inputs:\n`;
  let data = '';
  for (let j = 0; j <= n_timestamps; j++) {
    data =
      data +
      `             - timestamp: 2023-07-06T00:${String(j).padStart(
        2,
        '0'
      )},\n               duration: 10\n               cpu-util: ${
        j * 5
      }\n               e-net: 0.000811\n               requests: ${Math.floor(
        300 / j
      )}\n`;
  }
  inputData = inputData + child + data;
}

const out =
  frontmatter +
  pipeline +
  graph +
  config +
  configSciM +
  configSciO +
  configSci +
  children +
  inputData;
fs.writeFileSync(
  'examples/impls/auto-generated.yml',
  yaml.dump(yaml.load(out))
);
