# SCI (software carbon intensity)

[SCI](https://sci-guide.greensoftware.foundation/) represents the amount of carbon emitted per [functional unit](https://sci-guide.greensoftware.foundation/R/).

## Parameters

### Plugin config

- `functional-unit`: the name of the functional unit in which to express the carbon impact (required)

### Plugin parameter metadata

The `parameter-metadata` section contains information about `description`, `unit` and `aggregation-method` of the parameters of the inputs and outputs

- `inputs`: describe parameters of the `inputs`. Each parameter has:

  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: aggregation method object of the parameter
    - `time`: this value is used for `horizontal` aggregation. It can be of the following values: `sum`, `avg`, `copy`, or `none`.
    - `component`: this value is used for `vertical` aggregation. It can be of the following values: `sum`, `avg`, `copy`, or `none`.

- `outputs`: describe the `sci` parameter which has the following attributes:

  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: aggregation method object of the parameter
    - `time`: this value is used for `horizontal` aggregation. It can be of the following values: `sum`, `avg`, `copy`, or `none`.
    - `component`: this value is used for `vertical` aggregation. It can be of the following values: `sum`, `avg`, `copy`, or `none`.

### Mapping

The `mapping` block is an optional block. It is added in the plugin section and allows the plugin to receive a parameter from the input with a different name than the one the plugin uses for data manipulation. The parameter with the mapped name will not appear in the outputs. It also maps the output parameter of the plugin. The structure of the `mapping` block is:

```yaml
sci:
  method: Sci
  path: 'builtin'
  mapping:
    'parameter-name-in-the-plugin': 'parameter-name-in-the-input'
```

### Inputs

- `carbon`: total carbon in gCO2eq (required)
- `functional-unit`: whatever `functional-unit` you define in config also has to be present in each input, for example if you provide `functional-unit: requests` in config, `requests` must be present in your input data.

## Returns

- `sci`: carbon expressed in terms of the given functional unit

> Note: Plugin will warn and return `carbon` value in case if `functional-unit`'s value is zero.

## Calculation

SCI is calculated as:

```pseudocode
sci = carbon / functional unit
```

## IF Implementation

To run the plugin, you must first create an instance of `Sci`. Then, you can call `execute()` to return `sci`.

```typescript
import {Sci} from 'builtins';

const config = {'functional-unit': 'requests'}
const parametersMetadata = {inputs: {}, outputs: {}};

const sci = Sci(config, parametersMetadata, {});

const results = await sci.execute(
  [
    {
      'carbon': 5
      duration: 1,
      requests: 100,
    },
  ]
);
```

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in a `manifest` file. In this case, instantiating the plugin is handled by `if-run` and does not have to be done explicitly by the user.

The following is an example `manifest` that calls `sci`:

```yaml
name: sci-demo
description: example invoking sci plugin
tags:
initialize:
  plugins:
    sci:
      method: Sci
      path: 'builtin'
      config:
        functional-unit: 'requests'
tree:
  children:
    child:
      pipeline:
        compute:
          - sci
      inputs:
        - timestamp: 2023-07-06T00:00
          carbon: 5
          duration: 1
          requests: 100
```

You can run this example `manifest` by saving it as `./manifests/plugins/sci.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
if-run --manifest manifests/plugins/sci.yml --output manifests/outputs/sci.yml
```

The results will be saved to a new `yaml` file.

## Errors

`SCI` uses one of the IF error classes.

### `MissingInputDataError`

This error arises when a necessary piece of input data is missing from the `inputs` array.

Every element in the `inputs` array must contain:

- `timestamp`
- `duration`
- `carbon`: a numeric value named `carbon` must exist in the inputs array
- whatever value you passed to `functional-unit`

### Validation errors

There is also a validation step that checks that the `functional-unit` was provided in the plugin config. If you see an error reporting this value as missing, please check you have provided it.

For more information on our error classes, please visit [our docs](https://if.greensoftware.foundation/reference/errors)
