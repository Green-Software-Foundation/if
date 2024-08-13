# Divide

`divide` is a generic plugin for doing arithmetic division of two values in an `input` array.

You provide the names of the values you want to divide, and a name to use to add the divide to the output array.

## Parameters

### Plugin config

- `numerator` - a parameter by a specific configured number
- `denominator` - a parameter by a specific configured number or the number by which `numerator` is divided
- `output` - the number to a configured output parameter

### Plugin parameter metadata

The `parameter-metadata` section contains information about `description`, `unit` and `aggregation-method` of the parameters of the inputs and outputs

- `inputs`: describe the parameter of the `numerator` of the config. The parameter has the following attributes:

  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: aggregation method of the parameter (it can be `sum`, `avg` or `none`)

- `outputs`: describe the parameter of the `denominator` of the config. The parameter has the following attributes:
  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: aggregation method of the parameter (it can be `sum`, `avg` or `none`)

### Inputs

- `numerator` - as input parameter, must be available in the input array
- `denominator` - must be available in the input array if is an input parameter
- `output` - as input parameter, must be available in the input array

## Returns

- `output`: the division of `numerator` with the parameter name into `denominator` with the parameter name defined by `output` in config.

The plugin throws an exception if the division result is not a number.

> Note: Plugin will warn and return `numerator` value in case if `denominator` is zero.

## Calculation

```pseudocode
output = input0 / input1
```

## Implementation

To run the plugin, you must first create an instance of `Divide`. Then, you can call `execute()`.

```typescript
const config = {
  numerator: 'vcpus-allocated',
  denominator: 2,
  output: 'cpu/number-cores',
};
const divide = Divide(config, parametersMetadata);

const input = [
  {
    timestamp: '2021-01-01T00:00:00Z',
    duration: 3600,
    'vcpus-allocated': 24,
  },
];
```

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in a manifest file. In this case, instantiating the plugin is handled by `if` and does not have to be done explicitly by the user. The following is an example manifest that calls `divide`:

```yaml
name: divide-demo
description:
tags:
initialize:
  plugins:
    divide:
      method: Divide
      path: 'builtin'
      config:
        numerator: vcpus-allocated
        denominator: 2
        output: cpu/number-cores
tree:
  children:
    child:
      pipeline:
        compute:
          - divide
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          vcpus-allocated: 24
```

You can run this example by saving it as `./examples/manifests/divide.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
if-run --manifest ./examples/manifests/divide.yml --output ./examples/outputs/divide.yml
```

The results will be saved to a new `yaml` file in `./examples/outputs`.

## Errors

`Divide` exposes two of IF's error classes.

### ConfigError

You will receive an error starting `ConfigError: ` if you have not provided the expected configuration data in the plugin's `initialize` block.

The required parameters are:

- `numerator`: a string containing the name of the input parameter whose value should be divided by `denominator`
- `denominator`: a number to use as the denominator
- ``output`: a string containing the name to assign the result of the division

You can fix this error by checking you are providing valid values for each parameter in the config.

### `MissingInputDataError`

This error arises when a necessary piece of input data is missing from the `inputs` array.
Every element in the ``inputs` array must contain:

- `timestamp`
- `duration`
- whatever value you passed to `numerator`

For more information on our error classes, please visit [our docs](https://if.greensoftware.foundation/reference/errors
