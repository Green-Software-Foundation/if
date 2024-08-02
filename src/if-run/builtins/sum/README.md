# Sum

`sum` is a generic plugin for doing arithmetic sums of two or more values in an `input` array.

You provide the names of the values you want to sum, and a name to use to add the sum to the output array.

For example, you could add `cpu/energy` and `network/energy` and name the result `energy`. `energy` would then be added to every observation in your input array as the sum of `cpu/energy` and `network/energy`.

## Parameters

### Plugin config

Two parameters are required in global config: `input-parameters` and `output-parameter`.

`input-parameters`: an array of strings. Each string should match an existing key in the `inputs` array
`output-parameter`: a string defining the name to use to add the result of summing the input parameters to the output array.

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

The `mapping` block is an optional block. It is added in the plugin section and allows renaming the parameters of the input and output. The parameter with the new name will persist in the outputs. The structure of the `mapping` block is:

```yaml
sum:
  method: Sum
  path: 'builtin'
  mapping:
    'old-name': 'new-name'
```

### Inputs

All of `input-parameters` must be available in the input array.

## Returns

- `output-parameter`: the sum of all `input-parameters` with the parameter name defined by `output-parameter` in global config.

## Calculation

```pseudocode
output = input0 + input1 + input2 ... inputN
```

## Implementation

To run the plugin, you must first create an instance of `Sum`. Then, you can call `execute()`.

```typescript
const globalConfig = {
  inputParameters: ['cpu/energy', 'network/energy'],
  outputParameter: 'energy',
};
const parametersMetadata = {inputs: {}, outputs: {}};
const = mapping {
  'cpu/energy': 'energy-from-cpu',
  'network/energy': 'energy-from-network',
};

const sum = Sum(globalConfig, parametersMetadata, mapping);
const result = sum.execute([
  {
    timestamp: '2021-01-01T00:00:00Z',
    duration: 3600,
    'cpu/energy': 0.001,
    'memory/energy': 0.0005,
  },
]);
```

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in a manifest file. In this case, instantiating the plugin is handled by and does not have to be done explicitly by the user. The following is an example manifest that calls `sum`:

```yaml
name: sum demo
description:
tags:
initialize:
  plugins:
    sum:
      method: Sum
      path: 'builtin'
      global-config:
        input-parameters: ['cpu/energy', 'network/energy']
        output-parameter: 'energy'
      parameter-metadata:
        inputs:
          cpu/energy:
            description: energy consumed by the cpu
            unit: kWh
            aggregation-method: sum
          network/energy:
            description: energy consumed by data ingress and egress
            unit: kWh
            aggregation-method: sum
        outputs:
          energy:
            description: sum of energy components
            unit: kWh
            aggregation-method: sum
      mapping:
        cpu/energy: energy-from-cpu
        network/energy: energy-from-network
tree:
  children:
    child:
      pipeline:
        - sum
      config:
        sum:
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          cpu/energy: 0.001
          network/energy: 0.001
```

You can run this example by saving it as `./examples/manifests/sum.yml` and executing the following command from the project root:

```sh
if-run --manifest ./examples/manifests/sum.yml --output ./examples/outputs/sum.yml
```

The results will be saved to a new `yaml` file in `./examples/outputs`.

## Errors

`Sum` exposes two of the IF error classes.

### GlobalConfigError

You will receive an error starting `GlobalConfigError: ` if you have not provided the expected configuration data in the plugin's `initialize` block.

The required parameters are:

- `input-parameters`: this must be an array of strings, each being the name of a value in the `inputs` array
- `output-parameter`: this must be a string

You can fix this error by checking you are providing valid values for each parameter in the config.

### `MissingInputDataError`

This error arises when a necessary piece of input data is missing from the `inputs` array.
Every element in the ``inputs` array must contain:

- `timestamp`
- `duration`
- whatever values you passed to `input-parameters`

For more information on our error classes, please visit [our docs](https://if.greensoftware.foundation/reference/errors).
