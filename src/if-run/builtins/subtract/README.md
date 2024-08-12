# Subtract

`subtract` is a generic plugin for doing arithmetic subtractions of two or more values in an `input` array.

You provide the names of the values you want to subtract, and a name to use to add the subtraction to the output array.

For example, you could subtract `cpu/energy` and `network/energy` and name the result `offset/energy`. `offset/energy` would then be added to every observation in your input array as the diff of `cpu/energy` and `network/energy`.

## Parameters

### Plugin config

Two parameters are required in global config: `input-parameters` and `output-parameter`.

`input-parameters`: an array of strings. Each string should match an existing key in the `inputs` array
`output-parameter`: a string defining the name to use to add the result of the diff to the output array.

### Plugin parameter metadata

The `parameter-metadata` section contains information about `description`, `unit` and `aggregation-method` of the parameters of the inputs and outputs

- `inputs`: describe parameters of the `input-parameters` of the global config. Each parameter has the following attributes:

  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: aggregation method of the parameter (it can be `sum`, `avg` or `none`)

- `outputs`: describe the parameter of the `output-parameter` of the global config. The parameter has the following attributes:
  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: aggregation method of the parameter (it can be `sum`, `avg` or `none`)

### Mapping

The `mapping` block is an optional block. It is added in the plugin section and allows the plugin to receive a parameter from the input with a different name than the one the plugin uses for data manipulation. The parameter with the mapped name will not appear in the outputs. The structure of the `mapping` block is:

```yaml
subtract:
  method: Subtract
  path: 'builtin'
  mapping:
    'parameter-name-in-the-plugin': 'parameter-name-in-the-input'
```

### Inputs

All of `input-parameters` must be available in the input array.

## Returns

- `output-parameter`: the subtraction of all `input-parameters` with the parameter name defined by `output-parameter` in global config.

## Calculation

```pseudocode
output = input0 - input1 - input2 ... - inputN
```

## Implementation

To run the plugin, you must first create an instance of `Subtract`. Then, you can call `execute()`.

```typescript
import {Subtract} from 'builtins';

const globalConfig = {
  inputParameters: ['cpu/energy', 'network/energy'],
  outputParameter: 'offset/energy',
};
const parametersMetadata = {inputs: {}, outputs: {}};
const mapping = {};
const subtract = Subtract(globalConfig, parametersMetadata, mapping);
const result = subtract subtract.execute([
  {
    duration: 3600,
    timestamp: '2021-01-01T00:00:00Z',
    'cpu/energy': 0.005,
    'memory/energy': 0.0001,
  },
]);
```

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in a manifest file. In this case, instantiating the plugin is handled by and does not have to be done explicitly by the user. The following is an example manifest that calls `subtract`:

```yaml
name: subtract demo
description:
tags:
initialize:
  plugins:
    subtract:
      method: Subtract
      path: 'builtin'
      global-config:
        input-parameters: ['cpu/energy', 'network/energy']
        output-parameter: 'energy/diff'
tree:
  children:
    child:
      pipeline:
        compute:
          - subtract
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          cpu/energy: 0.003
          network/energy: 0.001
```

You can run this example by saving it as `./examples/manifests/test/subrtact.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
if-run --manifest /manifests/plugins/subtract.yml --output manifests/outputs/subtract.yml
```

The results will be saved to a new `yaml` file in `manifests/outputs`.

## Errors

`Subtract` uses one of IF's error classes:

### `InputValidationError`

This error arises when an invalid value is passed to `Subtract`. Typically, this can occur when a non-numeric value (such as a string made of alphabetic characters) is passed where a number or numeric string is expected. Please check that the types are correct for all the relevant fields in your `inputs` array.

For more information on our error classes, please visit [our docs](https://if.greensoftware.foundation/reference/errors)
