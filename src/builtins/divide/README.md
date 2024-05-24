# Divide

`divide` is a generic plugin for doing arithmetic division of two values in an `input` array.

You provide the names of the values you want to divide, and a name to use to add the divide to the output array.

For example, `boavizta-cpu` need `cpu/number-cores` to work, however `cloud-metadata` returns `vcpus-allocated`, to get number of cores you divide `vcpus-allocated` by 2.

## Parameters

### Plugin config

- `numerator` - a parameter by a specific configured number
- `denominator` - a parameter by a specific configured number or the number by which `numerator` is divided
- `output` - the number to a configured output parameter

### Inputs

- `numerator` - as input parameter, must be available in the input array
- `denominator` - must be available in the input array if is an input parameter
- `output` - as input parameter, must be available in the input array

## Returns

- `output`: the division of `numerator` with the parameter name into `denominator` with the parameter name defined by `output` in global config.

The plugin throws an exception if the division result is not a number.

## Calculation

```pseudocode
output = input0 / input1
```

## Implementation

To run the plugin, you must first create an instance of `Divide`. Then, you can call `execute()`.

```typescript
const globalConfig = {
  numerator: 'vcpus-allocated',
  denominator: 2,
  output: 'cpu/number-cores',
};
const divide = Divide(globalConfig);

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
  outputs:
    - yaml
  plugins:
    divide:
      method: Divide
      path: 'builtin'
      global-config:
        numerator: vcpus-allocated
        denominator: 2
        output: cpu/number-cores
tree:
  children:
    child:
      pipeline:
        - divide
      config:
        divide:
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          vcpus-allocated: 24
```

You can run this example by saving it as `./examples/manifests/divide.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
ie --manifest ./examples/manifests/divide.yml --output ./examples/outputs/divide.yml
```

The results will be saved to a new `yaml` file in `./examples/outputs`.
