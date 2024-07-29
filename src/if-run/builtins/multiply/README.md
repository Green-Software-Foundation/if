# Multiply

`multiply` is a generic plugin for multiplying two or more values in an `input` array.

You provide the names of the values you want to multiply, and a name to use to append the product to the output array.

For example, you could multiply `cpu/energy` and `network/energy` and name the result `energy-product`. `energy-product` would then be added to every observation in your input array as the product of `cpu/energy` and `network/energy`.

## Parameters

### Plugin config

Two parameters are required in global config: `input-parameters` and `output-parameter`.

`input-parameters`: an array of strings. Each string should match an existing key in the `inputs` array
`output-parameter`: a string defining the name to use to add the product of the input parameters to the output array.

### Plugin parameter metadata

The `parameter-metadata` section contains information about `description`, `unit` and `aggregation-method` of the parameters of the inputs and outputs

- `inputs`: describe parameters of the `input-parameters` of the global config. Each parameter has:

  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: aggregation method of the parameter (it can be `sum`, `avg` or `none`)

- `outputs`: describe the parameter of the `output-parameter` of the global config. The parameter has the following attributes:
  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: aggregation method of the parameter (it can be `sum`, `avg` or `none`)

### Mapping

The `mapping` block allows to rename the parameters of the input and output with new names. The structure of the `mapping` block is:

```yaml
mapping:
  'old-name': 'new-name'
```

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

const pluginSettings = {
  'global-config': {
    inputParameters: ['cpu/energy', 'network/energy'],
    outputParameter: 'energy-product',
  },
  'parameter-metadata': {},
  mapping: {},
};

const multiply = Multiply(pluginSettings);
const result = await multiply.execute([
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

## Errors

`Multiply` uses one of the IF error classes.

### `MissingInputDataError`

This error arises when a necessary piece of input data is missing from the `inputs` array.
Every element in the `inputs` array must contain:

- `timestamp`
- `duration`
- whatever values you passed to `input-parameters`

For more information on our error classes, please visit [our docs](https://if.greensoftware.foundation/reference/errors
