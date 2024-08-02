# Coefficient

`Coefficient` is a generic plugin for multiplying a value in an `input` array by a given coefficient.

You provide the name of the value you want to multiply, a coefficient value, and a name to use to append the product to the output array.

For example, you could multiply `cpu/energy` by 10 and name the result `energy-product`. `energy-product` would then be added to every observation in your input array as the product of `cpu/energy` and 10.

## Parameters

### Plugin global config

Three parameters are required in global config: `input-parameter`, `coefficient` and `output-parameter`.

- `input-parameter`: a string matching an existing key in the `inputs` array
- `coefficient`: the value to multiply `input-parameter` by.
- `output-parameter`: a string defining the name to use to add the product of the input parameters to the output array.

### Plugin parameter metadata

The `parameter-metadata` section contains information about `description`, `unit` and `aggregation-method`
of the parameters of the inputs and outputs

- `inputs`: describe parameters of the `input-parameter` of the global config. Each parameter has:

  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: aggregation method of the parameter (it can be `sum`, `avg` or `none`)

- `outputs`: describe parameters of the `output-parameter` of the global config. Each parameter has:
  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: aggregation method of the parameter (it can be `sum`, `avg` or `none`)

### Mapping

The `mapping` block is an optional block. It is added in the plugin section and allows renaming the parameters of the input and output. The parameter with the new name will persist in the outputs. The structure of the `mapping` block is:

```yaml
coefficient:
  method: Coefficient
  path: 'builtin'
  mapping:
    'old-name': 'new-name'
```

### Inputs

All of `input-parameters` must be available in the input array.

## Returns

- `output-parameter`: the product of all `input-parameters` with the parameter name defined by `output-parameter` in global config.

## Calculation

```pseudocode
output = input * coefficient
```

## Implementation

To run the plugin from a Typescript app, you must first create an instance of `Coefficient`. Then, you can call `execute()`.

```typescript
const globalConfig = {
  'input-parameter': 'carbon',
  coefficient: 10,
  'output-parameter': 'carbon-product',
};
const parametersMetadata = {inputs: {}, outputs: {}};
const mapping = {};

const coeff = Coefficient(globalConfig, parametersMetadata, mapping);
const result = coeff.execute([
  {
    duration: 3600,
    timestamp: '2021-01-01T00:00:00Z',
    carbon: 3,
  },
]);
```

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in a manifest file. In this case, instantiating the plugin is handled by `if-run` and does not have to be done explicitly by the user. The following is an example manifest that calls `coefficient`:

```yaml
name: coefficient-demo
description:
tags:
initialize:
  plugins:
    coefficient:
      method: Coefficient
      path: 'builtin'
      global-config:
        input-parameter: 'carbon'
        coefficient: 3
        output-parameter: 'carbon-product'
      parameter-metadata:
        inputs:
          carbon:
            description: 'an amount of carbon emitted into the atmosphere'
            unit: 'gCO2e'
            aggregation-method: sum
        outputs:
          carbon-product:
            description: 'a product of cabon property and the coefficient'
            unit: 'gCO2e'
            aggregation-method: sum
      mapping:
        carbon-product: calculated-carbon

tree:
  children:
    child:
      pipeline:
        - coefficient
      config:
        coefficient:
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          carbon: 30
```

You can run this example by saving it as `./examples/manifests/coefficient.yml` and executing the following command from the project root:

```sh
if-run --manifest ./examples/manifests/coefficient.yml --output ./examples/outputs/coefficient
```

The results will be saved to a new `yaml` file in `./examples/outputs`

## Errors

`Coefficient` exposes one of the IF error classes.

### GlobalConfigError

You will receive an error starting `GlobalConfigError: ` if you have not provided the expected configuration data in the plugin's `initialize` block.

The required parameters are:

- `input-parameter`: this must be a string
- `coefficient`: this must be a number
- `output-parameter`: this must be a string

You can fix this error by checking you are providing valid values for each parameter in the config.

For more information on our error classes, please visit [our docs](https://if.greensoftware.foundation/reference/errors)
