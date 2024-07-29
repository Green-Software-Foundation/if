# Time Converter

`time-coversion` is a generic plugin for converting energy values from a specifed time unit to a new given time unit.

You provide the energy value, the time unit associated with this energy, and a new time unit to which you want to convert it.

For example, you could add `energy-per-year`, the time unit `year`, and the new time unit `duration`. The `energy-per-duration` would then be added to every observation in your input array as the converted value of `energy-per-year`, `year` and `duration`.

## Parameters

### Plugin config

These parameters are required in global config:

- `input-parameter`: a string that should match an existing key in the `inputs` array
- `original-time-unit`: a string that defines the time unit of the `input-parameter`. The original time unit should be a valid unit, like `year`, `month`, `day`, `hour` and so on
- `new-time-unit`: a string that defines the new time unit that the `input-parameter` value should be converted to. The time unit can be `duration`(in which case it grabs the value from the `duration` in the input), or can be other time unit like `second`, `month`, `day`, `week` and so on
- `output-parameter`: a string defining the name to use to add the result of converting the input parameter to the output array

### Plugin parameter metadata

The `parameter-metadata` section contains information about `description` and `unit` of the parameters of the inputs and outputs

- `inputs`: describe parameters of the `input-parameter` of the global config. Each parameter has:

  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: the aggregation method of the parameter (can be `sum`, `avg` or `none`)

- `outputs`: describe the parameter of the `output-parameter` of the global config. The parameter has the following attributes:
  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: the aggregation method of the parameter (can be `sum`, `avg` or `none`)

### Inputs

The `input-parameter` must be available in the input array.

## Returns

- `output-parameter`: the converted energy of the `input-parameter` with the parameter name defined by `output-parameter` in global config.

## Calculation

```pseudocode
output = input-parameter / original-time-unit * new-time-unit
```

## Implementation

To run the plugin, you must first create an instance of `TimeConverter`. Then, you can call `execute()`.

```typescript
const config = {
  'input-parameter': 'energy-per-year',
  'original-time-unit': 'year',
  'new-time-unit': 'duration',
  'output-parameter': 'energy-per-duration',
};

const timeConverter = TimeConverter(config, parametersMetadata);
const result = timeConverter.execute([
  {
    timestamp: '2021-01-01T00:00:00Z',
    duration: 3600,
    'energy-per-year': 10000,
  },
]);
```

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in a manifest file. In this case, instantiating the plugin is handled by and does not have to be done explicitly by the user. The following is an example manifest that calls `time-coverstion`:

```yaml
name: time-coverstion demo
description:
tags:
initialize:
  plugins:
    time-converter:
      method: TimeConverter
      path: builtin
      global-config:
        input-parameter: 'energy-per-year'
        original-time-unit: 'year'
        new-time-unit: 'duration'
        output-parameter: 'energy-per-duration'
tree:
  children:
    child:
      pipeline:
        - time-converter
      config:
      defaults:
        energy-per-year: 10000
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
```

You can run this example by saving it as `./examples/manifests/time-coverstion.yml` and executing the following command from the project root:

```sh
if-run --manifest ./examples/manifests/time-coverstion.yml --output ./examples/outputs/time-coverstion.yml
```

The results will be saved to a new `yaml` file in `./examples/outputs`.

## Errors

`TimeConverter` exposes two of the IF error classes.

### GlobalConfigError

You will receive an error starting `GlobalConfigError: ` if you have not provided the expected configuration data in the plugin's `initialize` block.

The required parameters are:

- `input-parameter`: this must be a string, which is the name of parameter in the `inputs` array
- `original-time-unit`: this must be a string of time units (`minutes`, `seconds` and so on)
- `new-time-unit`: this must be a string of time units (e.g. `duration`, `minutes`, `seconds` and so on)
- `output-parameter`: this must be a string

You can fix this error by checking you are providing valid values for each parameter in the config.

### `MissingInputDataError`

This error arises when a necessary piece of input data is missing from the `inputs` array.
Every element in the `inputs` array must contain:

- `timestamp`
- `duration`
- whatever values you passed to `input-parameter`

For more information on our error classes, please visit [our docs](https://if.greensoftware.foundation/reference/errors).
