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
const config = {
  'input-parameter': 'carbon',
  coefficient: 10,
  'output-parameter': 'carbon-product',
};

const coeff = Coefficient(config);
const result = coeff.execute([
  {
    duration: 3600,
    timestamp: '2021-01-01T00:00:00Z',
    carbon: 3,
  },
]);
```

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in a manifest file. In this case, instantiating the plugin is handled by `ie` and does not have to be done explicitly by the user. The following is an example manifest that calls `coefficient`:

```yaml
name: coefficient-demo
description:
tags:
initialize:
  outputs:
    - yaml
  plugins:
    coefficient:
      method: Coefficient
      path: 'builtin'
      global-config:
        input-parameter: 'carbon'
        coefficient: 3
        output-parameter: 'carbon-product'
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
if-run --manifest ./examples/manifests/coefficient.yml --output ./examples/outputs/coefficient.yml
```

The results will be saved to a new `yaml` file in `./examples/outputs`


## Errors

`Coefficient exposes one of the IF error classes.

### GlobalConfigError

You will receive an error starting `GlobalConfigError: ` if you have not provided the expected configuration data in the plugin's `initialize` block.

The required parameters are:
- `input-parameter`: this must be a string
- `coefficient`: this must be a number
- `output-parameter`: this must be a string

You can fix this error by checking you are providing valid values for each parameter in the config.
