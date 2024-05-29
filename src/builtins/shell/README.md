# Shell Plugin

The `shell` is a wrapper enabling plugins implemented in any other programming language to be executed as a part of IF pipeline. For example, you might have a standalone plugin written in Python. `shell` spawns a subprocess to execute that Python plugin in a dedicated shell and pipes the results back into IF's Typescript process.

## Parameters

### Plugin global config

The plugin should be initialized as follows:

```
initialize:
  plugins:
    shell:
      method: Shell
      path: 'builtin'
      global-config:
        command: python3 /usr/local/bin/sampler
```

The `shell` plugin interface requires a path to the plugin command. This path is provided in the plugin configuration with the name command. The path should be appended by the execution command, for example, if the executable is a binary, the path would be prepended with `./` on a Linux system. If the plugin is a Python script, you can prepend `python`.

- `command`: the path to the plugin executable along with the execution command as it would be entered into a shell.

### Inputs

The parameters included in the `inputs` field in the `manifest` depend entirely on the plugin itself. A typical plugin might expect the following common data to be provided as `inputs`:

- `timestamp`: A timestamp for the specific input
- `duration`: The length of time these specific inputs cover

## Returns

The specific return types depend on the plugin being invoked. Typically, we would expect some kind of energy or carbon metric as an output, but it is also possible that plugins target different parts of the pipeline, such as data importers, adaptor plugins etc. Therefore, we do not specify return data for external plugins.

## Implementation

To run the plugin, you must first create an instance of `Shell` and call its `execute()` to run the external plugin.

```typescript
const output = Shell({command: '/usr/local/bin/sampler'});
const result = await output.execute([
  {
    timestamp: '2021-01-01T00:00:00Z',
    duration: 3600,
    'cpu/energy': 0.002,
    'memory/energy': 0.000005,
  },
]);
```

## Considerations

The `shell` is designed to run arbitrary external plugins. This means IF does not necessarily know what calculations are being executed in the external plugin. There is no strict requirement on the return type, as this depends upon the calculations and the position of the external plugin in a plugin pipeline. For example, one external plugin might carry out the entire end-to-end SCI calculation, taking in usage inputs and returning `sci`. In this case, the plugin is expected to return `sci` and it would be the only plugin invoked in the `manifest`.

However, it is also entirely possible to have external plugins that only deliver some small part of the overall pipeline, and rely on IF other plugins to do the rest.

Since the design space for external plugins is so large, it is up to external plugin developers to ensure compatibility with IF built-ins.

## Example manifest

IF users will typically call the shell plugin as part of a pipeline defined in a `manifest` file. In this case, instantiating and configuring the plugin is handled by and does not have to be done explicitly by the user. The following is an example `manifest` that calls an external plugin via `shell`. It assumes the plugin takes `cpu/energy` and `memory/energy` as inputs and returns `energy`:

```yaml
name: shell-demo
description:
tags:
initialize:
  outputs:
    - yaml
  plugins:
    sampler:
      method: Shell
      path: 'builtin'
      global-config:
        command: python3 /usr/local/bin/sampler
tree:
  children:
    child:
      pipeline:
        - sampler
      inputs:
        - timestamp: 2023-07-06T00:00
          duration: 1 # Secs
          cpu/energy: 0.002
          memory/energy: 0.000005
```

In this hypothetical example, the plugin is written in Python and invoked by executing `python3 /usr/local/bin/sampler` in a shell.
The plugin should return an `output` looking as follows:

```yaml
name: shell-demo
description:
tags:
initialize:
  outputs:
    - yaml
  plugins:
    sampler:
      method: Shell
      path: 'builtin'
      global-config:
        command: python3 /usr/local/bin/sampler
tree:
  children:
    child:
      pipeline:
        - sampler
      inputs:
        - timestamp: 2023-07-06T00:00
          duration: 1 # Secs
          cpu/energy: 0.002
          memory/energy: 0.000005
      outputs:
        - timestamp: 2023-07-06T00:00
          duration: 1 # Secs
          cpu/energy: 0.002
          memory/energy: 0.000005
          energy: 0.02 # added by plugin
```

You can run this example `manifest` by saving it as `manifests/plugins/shell.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
ie --manifest manifests/plugins/shell.yml --output manifests/outputs/shell.yml
```

The results will be saved to a new `yaml` file.
