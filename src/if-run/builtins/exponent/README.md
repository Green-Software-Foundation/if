# Exponent

`exponent` is a generic plugin for calculating exponent of an input param (as base) and another (as the exponent) in an `input` array.

You provide the names of the values you want to use for the exponent calculation, and a name to use to add the exponent result to the output array.

For example, you use `cpu/energy` as base and `network/energy` as and name the result `energy`. `energy` would then be added to every observation in your input array as `cpu/energy` raised by the exponent `network/energy`.

## Parameters

### Plugin config

Three parameters are required in global config: `input-parameter`, `exponent` and `output-parameter`.

`input-parameter`: a string defining the base. Must match an existing key in the `inputs` array
`exponent`: a number defining the exponent.
`output-parameter`: a string defining the name to use to add the result of the exponent to the output array.

### Plugin parameter metadata

The `parameter-metadata` section contains information about `description`, `unit` and `aggregation-method` of the parameters of the inputs and outputs

- `inputs`: describe the parameter of the `input-parameter` of the global config. The parameter has the following attributes:

  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: aggregation method of the parameter (it can be `sum`, `avg` or `none`)

- `outputs`: describe the parameter of the `output-parameter` of the global config. The parameter has the following attributes::
  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: aggregation method of the parameter (it can be `sum`, `avg` or `none`)

### Inputs

`input-parameter` and `exponent` must be available in the input array.

## Returns

- `output-parameter`: `input-parameter` raised by `exponent` with the parameter name defined by `output-parameter` in global config.

## Calculation

```pseudocode
output = input ^ exponent
```

## Implementation

To run the plugin, you must first create an instance of `Exponent`. Then, you can call `execute()`.

```typescript
import {Exponent} from 'builtins';

const config = {
  inputParameter: ['cpu/energy'],
  exponent: 2
  outputParameter: 'energy',
};

const exponent = Exponent(config);
const result = await exponent.execute([
  {
    duration: 3600,
    timestamp: '2021-01-01T00:00:00Z',
    'cpu/energy': 0.1,
    'energy': 0.01,
  },
]);
```

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in a manifest file. In this case, instantiating the plugin is handled by and does not have to be done explicitly by the user. The following is an example manifest that calls `exponent`:

```yaml
name: exponent demo
description:
tags:
initialize:
  plugins:
    exponent:
      method: Exponent
      path: 'builtin'
      global-config:
        input-parameter: 'cpu/energy'
        exponent: 2
        output-parameter: 'energy'
tree:
  children:
    child:
      pipeline:
        compute:
          - exponent
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          cpu/energy: 0.001
          network/energy: 0.001
```

You can run this example by saving it as `manifests/examples/test/exponent.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
if-run --manifest manifests/examples/test/exponent.yml --output manifests/outputs/exponent
```

The results will be saved to a new `yaml` file in `manifests/outputs`.

## Errors

`Exponent` exposes two of IF's error classes.

### `MissingInputDataError`

This error arises when a necessary piece of input data is missing from the `inputs` array.
Every element in the `inputs` array must contain:

- `timestamp`
- `duration`
- whatever value you passed to `input-parameter`

### `InputValidationError`

This error arises when an invalid value is passed to `Exponent`. Typically, this can occur when a non-numeric value (such as a string made of alphabetic characters) is passed where a number or numeric string is expected. Please check that the types are correct for all the relevant fields in your `inputs` array.

For more information on our error classes, please visit [our docs](https://if.greensoftware.foundation/reference/errors)
