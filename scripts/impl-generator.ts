import * as yaml from 'js-yaml';
import * as fs from 'fs';

const savepath = 'examples/impls/auto-generated-impl.yml';
const frontmatter =
  'name: nesting-demo\ndescription:\ntags:\nkind:\ninitialize:\n  plugins:\n';
const plugins = ['teads-curve', 'sci-e', 'sci-m', 'sci-o', 'sci'];
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
const n_nodes = 1000;
const n_timestamps = 50;
let inputData = '';
let pipeline = '';
let child = '';

let graph = 'graph:\n  children:\n    child:\n      pipeline:\n';
for (let i = 0; i < plugins.length; i++) {
  let path = '';
  if (plugins[i].includes('sci')) {
    path = '@grnsft/if-models';
  } else {
    path = '@grnsft/if-unofficial-models';
  }
  pipeline =
    pipeline +
    `    - name: ${plugins[i]}\n      plugin: ${classes[i]}\n      path: "${path}"\n`;
  graph = graph + `        - ${plugins[i]}\n`;
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
fs.writeFileSync(savepath, yaml.dump(yaml.load(out)));
