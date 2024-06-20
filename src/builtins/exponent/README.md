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
  outputs:
    - yaml
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
        - exponent
      config:
        exponent:
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          cpu/energy: 0.001
          network/energy: 0.001
```

You can run this example by saving it as `manifests/examples/test/exponent.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
if-run --manifest manifests/examples/test/exponent.yml --output manifests/outputs/exponent.yml
```

The results will be saved to a new `yaml` file in `manifests/outputs`.

## Errors

`Exponent` exposes two of IF's error classes.

### `MissingInputDataError`

This error arises when a necessary piece of input data is missing from the `inputs` array.
Every element in the ``inputs` array must contain:

- `timestamp`
- `duration`
- whatever value you passed to `input-parameter`


### `InputValidationError`

This error arises when an invalid value is passed to `Exponent`. Typically, this can occur when a non-numeric value (such as a string made of alphabetic characters) is passed where a number or numeric string is expected. Please check that the types are correct for all the relevant fields in your `inputs` array.
