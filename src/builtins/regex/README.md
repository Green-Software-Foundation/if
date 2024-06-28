# Regex

`regex` is a generic plugin to match part of one string in an `input` and extract it into an output.

You provide the name of the value you want to match, and a name to use to add the regex to the output array.

```
Intel® Xeon® Platinum 8272CL,Intel® Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz,Intel® Xeon® E5-2673 v3 2.4 GHz
```

## Parameters

### Plugin config

- `parameter` - a parameter by a specific configured string
- `match` - a regex by which needs to match the `parameter`
- `output` - output parameter name in the input

### Inputs

- `parameter` - as input parameter, must be available in the input array

## Returns

- `output`: the first match of `parameter` with the parameter name with `match` defined in global config.

## Implementation

To run the plugin, you must first create an instance of `Regex`. Then, you can call `execute()`.

```typescript

const globalConfig = {
  parameter: 'physical-processor',
  match: '^[^,]+',
  output: 'cpu/name',
};
const regex = Regex(globalConfig);

const input = [
  {
    timestamp: '2021-01-01T00:00:00Z',
    duration: 3600,
    'physical-processor':
      'Intel® Xeon® Platinum 8272CL,Intel® Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz,Intel® Xeon® E5-2673 v3 2.4 GHz',
  },
];
```

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in a manifest file. In this case, instantiating the plugin is handled by `if` and does not have to be done explicitly by the user. The following is an example manifest that calls `regex`:

```yaml
name: regex-demo
description:
tags:
initialize:
  outputs:
    - yaml
  plugins:
    regex:
      method: Regex
      path: 'builtin'
      global-config:
        parameter: physical-processor
        match: ^[^,]+
        output: cpu/name
tree:
  children:
    child:
      pipeline:
        - regex
      config:
        regex:
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          physical-processor: Intel® Xeon® Platinum 8272CL,Intel® Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz,Intel® Xeon® E5-2673 v3 2.4 GHz
```

You can run this example by saving it as `manifests/plugins/regex.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
if --manifest manifests/examples/regex.yml --output manifests/outputs/regex.yml
```

The results will be saved to a new `yaml` file in `manifests/outputs`.

## Errors

`Regex` uses three of IF's error classes:

### `MissingInputDataError`

This error arises when a necessary piece of input data is missing from the `inputs` array.
Every element in the `inputs` array must contain:
- `timestamp`
- `duration`
- whatever value you passed to `parameter`


### `GlobalConfigError`

You will receive an error starting `GlobalConfigError: ` if you have not provided the expected configuration data in the plugin's `initialize` block.

The required parameters are:

- `parameter`: a string containing the name of a value in the inputs array
- `match`: a valid regex pattern
- `output`: a string

You can fix this error by checking you are providing valid values for each parameter in the config.


### `RegexMismatchError`

This error arises when the requested regex cannot find any matches in the given data. If there are multiple matches, the plugin returns the first, but if there are none, it throws this error.

For more information on our error classes, please visit [our docs](https://if.greensoftware.foundation/reference/errors
