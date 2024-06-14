# Multiply

`multiply` is a generic plugin for multiplying two or more values in an `input` array.

You provide the names of the values you want to multiply, and a name to use to append the product to the output array.

For example, you could multiply `cpu/energy` and `network/energy` and name the result `energy-product`. `energy-product` would then be added to every observation in your input array as the product of `cpu/energy` and `network/energy`.

## Parameters

### Plugin config

Two parameters are required in global config: `input-parameters` and `output-parameter`.

`input-parameters`: an array of strings. Each string should match an existing key in the `inputs` array
`output-parameter`: a string defining the name to use to add the product of the input parameters to the output array.

### Inputs

All of `input-parameters` must be available in the input array.

## Returns

- `output-parameter`: the product of all `input-parameters` with the parameter name defined by `output-parameter` in global config.

## Calculation

```pseudocode
output = input0 * input1 * input2 ... inputN
```

## Implementation

To run the plugin, you must first create an instance of `Multiply`. Then, you can call `execute()`.

```typescript
import {Multiply} from 'builtins';

const config = {
  inputParameters: ['cpu/energy', 'network/energy'],
  outputParameter: 'energy-product',
};

const mult = Multiply(config);
const result = await mult.execute([
  {
    duration: 3600,
    timestamp: '2021-01-01T00:00:00Z',
    'cpu/energy': 0.001,
    'memory/energy': 0.0005,
  },
]);
```

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in a manifest file. In this case, instantiating the plugin is handled by `ie` and does not have to be done explicitly by the user. The following is an example manifest that calls `multiply`:

```yaml
name: multiply-demo
description:
tags:
initialize:
  outputs:
    - yaml
  plugins:
    multiply:
      method: Multiply
      path: 'builtin'
      global-config:
        input-parameters: ['cpu/energy', 'network/energy']
        output-parameter: 'energy-product'
tree:
  children:
    child:
      pipeline:
        - multiply
      config:
        multiply:
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          cpu/energy: 0.001
          network/energy: 0.001
```

You can run this example by saving it as `./examples/manifests/test/multiply.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
if-run --manifest ./examples/manifests/test/multiply.yml --output ./examples/outputs/multiply.yml
```

The results will be saved to a new `yaml` file in `./examples/outputs`
