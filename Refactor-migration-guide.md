# Managing the IF refactor

We recently completed a major refactor of the entire IF codebase, moving from an object oriented to functional programmign style.

If you are a IF user or developer, there are some changes you must be aware of resulting from a recent refactor of the IF codebase. This guide will help you to update your processes to integrate your work with the newly refactored IF.

## Running IF

There have been some name changes to the CLI, specifically:

- `impact-engine` --> `ie`
    The command line tool has been renamed from `impact-engine` to simply `ie`. This means that to invoke the Impact Framework on the command line you simply use 

    ```
    ie ...
    ```
-  `impl` --> `manifest` 
    We have deprecated the original `impl` and `ompl` terminology across all our repositories and on the command line. Now, to pass a manifest file to IF, you use the `--manifest` command, as follows:

    ```sh
    ie --manifest <path-to-manifest>
    ```


- `ompl` --> `output`
 
    We have deprecated the original `impl` and `ompl` terminology across all our repositories and on the command line. Now, to define a savepath for your output file, you use the `--output` command, as follows:

    ```sh
    ie --manifest <path-to-manifest> --output <savepath>
    ```

## Outputs

We currently default to exporting output data to the console only. If you want to export to a file, you have to add a small piece of config inside your manifest, as follows:

```yaml
initalize:
  plugins: ...
  outputs: ['yaml']
```

You then provide your savepatrh (without file extension) to the `--output` command on the CLI.

The available options are currently `csv`, `yaml` or `log`.

### Summary of how to run the refactored IF 

As before, you can install IF from our npm package using

```
npm i @grnsft/if
```

Then run IF using the following command:

```sh
ie --manifest <path-to-manifest>
```

This will dump the output to the console. If you want to save the output to a yaml file, provide a savepath to the `--output` command:

```sh
ie --manifest <path-to-manifest> --output <savepath>
```


If you want to clone the source code and install and run a local copy of IF, you can do so using:

```sh
git clone https://github.com/Green-Software-Foundation/if &&
cd if &&
npm i
```

Then run IF using the following command:

```sh
npm run if -- --manifest <path-to-manifest>
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
        "sci-e":
          path: "@grnsft/if-plugins"
          method: SciE
    ```

- **Rename `model` to `method` in `Initialize` block**
    Each plugin in the initialize block 

    Each plugin in the `Initialize` block has a field where the name of the exported function representing that plugin is defined. Previously, these were class names and they were defined using the `model` key. Now, they are functions, and they are defined using the `method` key. We use `method` instead of `function` because `function` is a reserved keyword in Typescript.
    
    For example:
    
    ```yaml
    "sci-embodied":
      path: "builtin"
      method: SciEmbodied
    ```

- **Global config**
    We have introduced the concept of global config to the plugins. This is truly global configuration data that should be kept constant regardless of where the plugin is invoked across the manifest file. 
    
    A good example is the `interpolation` method to use in the Teads curve plugin - this is not expected to vary from component to component and can therefore be defined in global config. The plugin code itself must expect the global config. Then, the config can be passed in the `Initialize` block, for example:
    
    ```yaml
    initialize:
      plugins:
        "time-sync":
           method: TimeSync
           path: "builtin"
           global-config:
             start-time: "2023-12-12T00:00:00.000Z"
             end-time: "2023-12-12T00:01:00.000Z"
             interval: 5
             allow-padding: true
    ```

- **Node level config**

    We have also introduced the concept of node-level config. This is designed for pluin configuration that might vary between components in the tree. For example, for each child in the tree you might wish to use the `groupby` plugin to group the outputs according to a different set of keys.

    ```yaml
    tree:
      children:
        child-1:
          pipeline:
            - teads-curve
            - sci-e
            - sci-embodied
            - sci-o
            - time-sync
            - sci
          config:
            group-by:
              group:
                - region
                - cloud/instance-type
    ```

- **Defaults**

    We have also introduced the concept of `defaults`. This is a section in each component's definition that can be used to provide fallbacks for missing input data. For example, perhaps you have a value arriving from an external API that should be present in every observation in your inputs array, but for soem reason the API fails to deliver a value for some timestamps. In this case, IF would fallback to the value provided for that metric in the `defaults` section of the manifest for that component.

    You can also use `defaults` as a quick way to add values to everyobservation in your input array if those values are expected to be constant over time (e.g. some of the lifespan values for embodied carbon calculations could be appropriate to include in defaults). This saves you from having to enter the value in every observation in the input array, instead IF can automatically grab it from `defaults` for every timestamp. 

    ```yaml
    tree:
      children:
        child-1:
          pipeline:
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
            functional-unit-time: "1 min"
    ```



## New IF features

### Time-sync
Technically time-sync is not a new feature as it was present in IF before the refactor, but there are some tweaks to how the plugin is configured that are worth explaining here. Time sync snaps all input arrays across an entire graph to a common time grid. 

This means you have to define a global start time, end time and interval to use everywhere. There is also a boolean to toggle whether you should allow the time sync model to pad the start and end of your time series with zeroes. You should default to `true` unless you have a specific reason not to. In the refactored IF we expect this information to be provided in global config, as follows:

```yaml
initialize:
    plugins:
        "time-sync":
          method: TimeSync
          path: "builtin"
          global-config:
            start-time: "2023-12-12T00:00:00.000Z"
            end-time: "2023-12-12T00:01:00.000Z"
            interval: 5
            allow-padding: true
```

### Aggregate

The aggregate plugin aggregates data in two ways: first it condenses individual time series down into a single value (in many cases, this will be the total across the observation period for each metric) and aggregating multiple time series from several components into a single time series (in many cases this means the sum of the metric across multiple componments for each timestep).

This is a builtin feature of IF, meaning it does not have to be initialized as a plugin. Instead, you just have to include a short config block in the top of the manifest file. There are two pieces of information required:

- `metrics`: which metrics do you want to aggregate? Every metric you provide here must exist in the output array. 

- `type`: the options are `horizontal`, `vertical` or both. Horizontal aggregation is the type that condenses each time series into a single summary value. Vertical aggregation is aggregated across components.

Here's what the config block should look like:

```yaml
aggregation:
  metrics:
    - 'carbon'
  type: 'both'
```


### Groupby

Groupby allows you to regroup your outputs according to keys you define. For example, maybe you want to group your outputs by region (show me all the outputs for applications run in `uk-south` etc). Groupby *is* a plugin that needs to be initialized in the manifest.

You can initialize the plugin as follows:

```yaml
initialize:
  plugins:
    'group-by':
      path: builtin
      method: GroupBy
```

Then you configure groupby for each component in the node level config. In the following example we will regroup the outputs by the `region`:

```yaml
tree:
  children:
    child-1:
      pipeline:
        - teads-curve
        - sci-e
        - sci-embodied
        - sci-o
        - time-sync
        - group-by
        - sci
      config:
        group-by:
          group:
            - region
```

### Exhaust

We have introduced `exhaust` as an IF feature. This is a wrapper around export plugins and it allows community contributors to create plugins for exporting to different formats. 

Details tbc...


## Plugins

The plugins themselves require some changes to keep them compatible with the refactored IF.

Instead of the old class-based model, plugins are now functions. They conform to the following interface:

```ts
export type PluginInterface = {
  execute: (
    inputs: PluginParams[],
    config?: Record<string, any>
  ) => PluginParams[];
  metadata: {
    kind: string;
  };
  [key: string]: any;
};
```

The plugin still requires an execute function. This is where you implement the plugin logic.

Here's a minimal example for a plugin that sums some inputs defined in global config - see inline comments for some important notes:

```ts

// Here's the function definition - notice that global config is passed in here!
export const Sum = (globalConfig: SumConfig): PluginInterface => {
  const inputParameters = globalConfig['input-parameters'] || [];
  const outputParameter = globalConfig['output-parameter'];
    
    // we also return metadata now too - you can add more or just use this default
  const metadata = {
    kind: 'execute',
  };
    
   /**
   * Calculate the sum of the input metrics for each timestamp.
   */
  const execute = async (inputs: PluginParams[]): Promise<PluginParams[]> => {
    inputs.map(input => {
      return calculateSum(input, inputParameters, outputParameter);
    });
    return inputs;
  };

  /**
   * Calculates the sum of the energy components.
   */
  const calculateSum = (
    input: PluginParams,
    inputParameters: string[],
    outputParameter: string
  ) => {
    input[outputParameter] = inputParameters.reduce(
      (accumulator, metricToSum) => {
        return accumulator + input[metricToSum];
      },
      0
    );
  };

    // return the metadata and the execute function
  return {
    metadata,
    execute,
  };
};
```
