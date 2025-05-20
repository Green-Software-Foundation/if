# Copy-param

`copy-param` is a generic plugin that duplicates an existing parameter in the `input` data and assigns it to a new key. You can either keep or delete the original copied parameter. A common use case for this is to rename parameters in the `inputs` array.

You provide the name of the value you want to copy, and a name to assign the copy to. You also toggle a `keep-existing` parameter to either persist or delete the original copied value.

For example, you could copy `energy` into `energy-copy`, with `keep-existing=true`. In this case your inputs:

```yaml
- timestamp: "2023-12-12T00:00:13.000Z",
  duration: 30,
  energy: 30
```

would become

```yaml
- timestamp: "2023-12-12T00:00:13.000Z",
  duration: 30,
  energy: 30
  energy-copy: 30
```

but with `keep-existing=false`, the same inputs would yield:

```yaml
- timestamp: "2023-12-12T00:00:13.000Z",
  duration: 30,
  energy-copy: 30
```

## Parameters

### Config

Three parameters are required in config: `from` and `to` and `keep-existing`.

`from`: an array of strings. Each string should match an existing key in the `inputs` array
`to`: a string defining the name to use to add the result of summing the input parameters to the output array.
`keep-existing`: toggles whether to keep or delete the copied parameter (defined in `to`)

### Plugin parameter metadata

The `parameter-metadata` section contains information about `description`, `unit` and `aggregation-method` of the parameters of the inputs and outputs

- `inputs`: describe the parameter of the `from` of the config. The parameter has the following attributes:

  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: aggregation method object of the parameter
    - `time`: this value is used for `horizontal` aggregation. It can be of the following values: `sum`, `avg`, `copy`, or `none`.
    - `component`: this value is used for `vertical` aggregation. It can be of the following values: `sum`, `avg`, `copy`, or `none`.

- `outputs`: describe the parameters of the `to` of the config. The parameter has the following attributes:
  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: aggregation method object of the parameter
    - `time`: this value is used for `horizontal` aggregation. It can be of the following values: `sum`, `avg`, `copy`, or `none`.
    - `component`: this value is used for `vertical` aggregation. It can be of the following values: `sum`, `avg`, `copy`, or `none`.

### Mapping

The `mapping` block is an optional block. It is added in the plugin section and allows the plugin to receive a parameter from the input with a different name than the one the plugin uses for data manipulation. The parameter with the mapped name will not appear in the outputs. It also maps the output parameter of the plugin. The structure of the `mapping` block is:

```yaml
copy-param:
  path: builtin
  method: Copy
  mapping:
    'parameter-name-in-the-plugin': 'parameter-name-in-the-input'
```

### Inputs

As with all plugins, `timestamp` and `duration` are required. The key passed to `from` must exist in the `input` data.

## Returns

The plugin adds a new parameter with the name defined in `to` to the `input` data.

## Implementation

To run the plugin, you must first create an instance of `Copy`. Then, you can call `execute()`.

```typescript
import {Copy} from '.';

const config = {
  'keep-existing': true,
  from: 'from-param',
  to: 'to-param',
};
const parametersMetadata = {inputs: {}, outputs: {}};
const mapping = {};

const plugin = Copy(config, parametersMetadata, mapping);

const result = await plugin.execute([
  {
    timestamp: '2023-12-12T00:00:13.000Z',
    duration: 30,
    'from-param': 'hello',
  },
]);

console.log(result);
```

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in a manifest file. In this case, instantiating the plugin is handled by and does not have to be done explicitly by the user. The following is an example manifest that calls `copy-param`:

```yaml
name: copy-param
description:
tags:
initialize:
  plugins:
    copy-param:
      path: builtin
      method: Copy
      config:
        keep-existing: true
        from: original
        to: copy
tree:
  children:
    child-1:
      pipeline:
        compute:
          - copy-param
      inputs:
        - timestamp: '2023-12-12T00:00:00.000Z'
          original: 'hello'
```

You can run this example by saving it as `./manifests/examples/copy.yml` and executing the following command from the project root:

```sh
if-run --manifest ./manifests/examples/copy.yml -s
```

The results will be displayed in the console.
