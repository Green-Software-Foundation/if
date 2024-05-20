# Subtract

`subtract` is a generic plugin for doing arithmetic subtractions of two or more values in an `input` array.

You provide the names of the values you want to subtract, and a name to use to add the subtraction to the output array.

For example, you could subtract `cpu/energy` and `network/energy` and name the result `offset/energy`. `offset/energy` would then be added to every observation in your input array as the diff of `cpu/energy` and `network/energy`.

## Parameters

### Plugin config

Two parameters are required in global config: `input-parameters` and `output-parameter`.

`input-parameters`: an array of strings. Each string should match an existing key in the `inputs` array
`output-parameter`: a string defining the name to use to add the result of the diff to the output array.

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

const config = {
  inputParameters: ['cpu/energy', 'network/energy'],
  outputParameter: 'offset/energy',
};

const subtract = Subtract(config);
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
  outputs:
    - yaml
  plugins:
    subtract:
      method: Subtract
      path: 'builtins'
      global-config:
        input-parameters: ['cpu/energy', 'network/energy']
        output-parameter: 'energy/diff'
tree:
  children:
    child:
      pipeline:
        - subtract
      config:
        subtract:
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          cpu/energy: 0.003
          network/energy: 0.001
```

You can run this example by saving it as `./examples/manifests/test/subrtact.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
ie --manifest /manifests/plugins/subtract.yml --output manifests/outputs/subtract.yml
```

The results will be saved to a new `yaml` file in `manifests/outputs`.
