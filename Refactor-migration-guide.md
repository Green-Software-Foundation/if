# Managing the IF refactor

We recently completed a major refactor of the entire IF codebase, moving from an object oriented to functional programmign style.

If you are a IF user or developer, there are some changes you must be aware of resulting from a recent refactor of the IF codebase. This guide will help you to update your processes to integrate your work with the newly refactored IF.

## Running IF

There have been some name changes to the CLI, specifically:

- `impact-engine` --> `if-run`
  The command line tool has been renamed from `impact-engine` to simply `if-run`. This means that to invoke the Impact Framework on the command line you simply use

  ```
  if-run ...
  ```

- `impl` --> `manifest`
  We have deprecated the original `impl` and `ompl` terminology across all our repositories and on the command line. Now, to pass a manifest file to IF, you use the `--manifest` command, as follows:

  ```sh
  if-run --manifest <path-to-manifest>
  ```

- `ompl` --> `output`

  We have deprecated the original `impl` and `ompl` terminology across all our repositories and on the command line. Now, to define a savepath for your output file, you use the `--output` command, as follows:

  ```sh
  if-run --manifest <path-to-manifest> --output <savepath>
  ```

### Summary of how to run the refactored IF

As before, you can install IF from our npm package using

```
npm i @grnsft/if
```

Then run IF using the following command:

```sh
if-run --manifest <path-to-manifest>
```

This will dump the output to the console. If you want to save the output to a yaml file, provide a savepath to the `--output` command:

```sh
if-run --manifest <path-to-manifest> --output <savepath>
```

If you want to clone the source code and install and run a local copy of IF, you can do so using:

```sh
git clone https://github.com/Green-Software-Foundation/if &&
cd if &&
npm i
```

Then run IF using the following command:

```sh
npm run if-run -- --manifest <path-to-manifest>
```

## Manifest files

There have also been some changes to the structure of manifest files. Some of these are simple renaming changes, others are more functional.

- **Rename `graph` -> `tree`**
  The `graph` section of the manifest file is now renamed to `tree`. This is just to help us stay consistent in our metaphors and provide a more familiar naming convention for the data beneath.

- **Use plugin name as key in `Initialize` block**
  In the previous version of IF, the plugins were organized into an array each having a `name` key, with the plugin name as the value. In the refactored IF, we use the name as the key identifying the plugin. For example, this is the OLD way:

  ```yaml
  initialize:
    plugins:
      - name: ccf
        model: CloudCarbonFootprint
        path: if-plugins
  ```

  This is the new way:

  ```yaml
  initialize:
    plugins:
      'sci-e':
        path: '@grnsft/if-plugins'
        method: SciE
  ```

- **Rename `model` to `method` in `Initialize` block**
  Each plugin in the initialize block

  Each plugin in the `Initialize` block has a field where the name of the exported function representing that plugin is defined. Previously, these were class names and they were defined using the `model` key. Now, they are functions, and they are defined using the `method` key. We use `method` instead of `function` because `function` is a reserved keyword in Typescript.

  For example:

  ```yaml
  'sci-embodied':
    path: 'builtin'
    method: SciEmbodied
  ```

- **Config**
  We have introduced the concept of config to the plugins. This is truly configuration data that should be kept constant regardless of where the plugin is invoked across the manifest file.

  A good example is the `interpolation` method to use in the Teads curve plugin - this is not expected to vary from component to component and can therefore be defined in config. The plugin code itself must expect the config. Then, the config can be passed in the `Initialize` block, for example:

  ```yaml
  initialize:
    plugins:
      'time-sync':
        method: TimeSync
        path: 'builtin'
        config:
          start-time: '2023-12-12T00:00:00.000Z'
          end-time: '2023-12-12T00:01:00.000Z'
          interval: 5
          allow-padding: true
  ```

- **Defaults**

  We have also introduced the concept of `defaults`. This is a section in each component's definition that can be used to provide fallbacks for missing input data. For example, perhaps you have a value arriving from an external API that should be present in every observation in your inputs array, but for soem reason the API fails to deliver a value for some timestamps. In this case, IF would fallback to the value provided for that metric in the `defaults` section of the manifest for that component.

  You can also use `defaults` as a quick way to add values to everyobservation in your input array if those values are expected to be constant over time (e.g. some of the lifespan values for embodied carbon calculations could be appropriate to include in defaults). This saves you from having to enter the value in every observation in the input array, instead IF can automatically grab it from `defaults` for every timestamp.

  ```yaml
  tree:
    children:
      child-1:
        pipeline:
          compute:
            - teads-curve
            - sci-e
            - sci-embodied
            - sci-o
            - time-sync
            - sci
       defaults:
          cpu/thermal-design-power: 100
          grid/carbon-intensity: 800
          device/emissions-embodied: 1533.120 # gCO2eq
          time-reserved: 3600 # 1hr in seconds
          device/expected-lifespan: 94608000 # 3 years in seconds
          resources-reserved: 1
          resources-total: 8
  ```

## New IF features

### Time-sync

Technically time-sync is not a new feature as it was present in IF before the refactor, but there are some tweaks to how the plugin is configured that are worth explaining here. Time sync snaps all input arrays across an entire graph to a common time grid.

This means you have to define a start time, end time and interval to use everywhere. There is also a boolean to toggle whether you should allow the time sync model to pad the start and end of your time series with zeroes. You should default to `true` unless you have a specific reason not to. In the refactored IF we expect this information to be provided in config, as follows:

```yaml
initialize:
  plugins:
    'time-sync':
      method: TimeSync
      path: 'builtin'
      config:
        start-time: '2023-12-12T00:00:00.000Z'
        end-time: '2023-12-12T00:01:00.000Z'
        interval: 5
        allow-padding: true
```

### Aggregate

The aggregate plugin aggregates data in two ways: first it condenses individual time series down into a single value (in many cases, this will be the total across the observation period for each metric) and aggregating multiple time series from several components into a single time series (in many cases this means the sum of the metric across multiple componments for each timestep).

This is a builtin feature of IF, meaning it does not have to be initialized as a plugin. Instead, you just have to include a short config block in the top of the manifest file. There are two pieces of information required:

- `metrics`: which metrics do you want to aggregate? Every metric you provide here must exist in the output array and be described in the `parameter-metadata` of the plugin.

- `type`: the options are `horizontal`, `vertical` or both. Horizontal aggregation is the type that condenses each time series into a single summary value. Vertical aggregation is aggregated across components.

Here's what the config block should look like:

```yaml
aggregation:
  metrics:
    - carbon
  type: 'both'
```

### Exhaust

We have introduced `exhaust` as an IF feature. This is a wrapper around export plugins and it allows community contributors to create plugins for exporting to different formats.

Details tbc...

## Plugins

Plugins require some modifications to remain compatible with the refactored IF interface.

Each plugin follows the `PluginFactory` interface, which is a higher-order function that accepts a `params` object of type `PluginFactoryParams`. This function returns another function (the inner function), which handles the plugin’s `config`, `parametersMetadata`, and `mapping`.

```ts
export const PluginFactory =
  (params: PluginFactoryParams) =>
  (
    config: ConfigParams = {},
    parametersMetadata: PluginParametersMetadata,
    mapping: MappingParams
  ) => ({
    metadata: {
      inputs: {...params.metadata.inputs, ...parametersMetadata?.inputs},
      outputs: parametersMetadata?.outputs || params.metadata.outputs,
    },
    execute: async (inputs: PluginParams[]) => {
      // Generic plugin functionality goes here
      // E.g., mapping, arithmetic operations, validation
      // Process inputs and mapping logic
    });
  })
```

Inner Function Parameters:

- `config`: This is of type `ConfigParams` and has a default value of an empty object ({}). This might hold configuration settings for the plugin.
- `parametersMetadata`: A `PluginParametersMetadata` object that describes the metadata for the plugin’s parameters.
- `mapping`: A `MappingParams` object, describing parameters are mapped.

Implementation Function:

The plugin requires an `implementation` function, where the actual plugin logic is defined.
Here’s a minimal example of a plugin that sums inputs as defined in the config. See the inline comments for further clarification.

```ts
// Here's the function definition!
export const Sum = PluginFactory({
  configValidation: z.object({
    'input-parameters': z.array(z.string()),
    'output-parameter': z.string().min(1),
  }),
  inputValidation: (input: PluginParams, config: ConfigParams) => {
    return validate(validationSchema, inputData);
  },
  implementation: async (inputs: PluginParams[], config: ConfigParams) => {
    const {
      'input-parameters': inputParameters,
      'output-parameter': outputParameter,
    } = config;

    return inputs.map(input => {
      const calculatedResult = calculateSum(input, inputParameters);

      return {
        ...input,
        [outputParameter]: calculatedResult,
      };
    });
  },
  allowArithmeticExpressions: [],
});

/**
 * Calculates the sum of the energy components.
 */
const calculateSum = (input: PluginParams, inputParameters: string[]) =>
  inputParameters.reduce(
    (accumulator, metricToSum) => accumulator + input[metricToSum],
    0
  );
```
