# SCI-Embodied

Software systems cause emissions through the hardware that they operate on, both through the energy that the physical hardware consumes and the emissions associated with manufacturing the hardware. Embodied carbon refers to the carbon emitted during the manufacture and eventual disposal of a component. It is added to the operational carbon (carbon emitted when a component is used) to give an overall SCI score.

Read more on [embodied carbon](https://github.com/Green-Software-Foundation/sci/blob/main/Software_Carbon_Intensity/Software_Carbon_Intensity_Specification.md#embodied-emissions).

## Parameters

### Plugin Configuration

The `SciEmbodied` plugin requires a configuration object and parameter metadata (optional) to do the calculation.

### Plugin Parameter Metadata

The `parameter-metadata` section contains information about the `description`, `unit`, and `aggregation-method` of the input and output parameters.

- `inputs`: Describes the parameters for the input data. Each parameter includes:
  - `description`: A brief description of the parameter.
  - `unit`: The unit of measurement for the parameter.
  - `aggregation-method`: The method used to aggregate this parameter (`sum`, `avg`, or `none`).

- `outputs`: Describes the `carbon-embodied` parameter, which includes:
  - `description`: A brief description of the parameter.
  - `unit`: The unit of measurement for the parameter.
  - `aggregation-method`: The method used to aggregate this parameter (`sum`, `avg`, or `none`).

### Mapping

The `mapping` block is an optional block. It is added in the plugin section and allows the plugin to receive a parameter from the input with a different name than the one the plugin uses for data manipulation. The parameter with the mapped name will not appear in the outputs. It also maps the output parameter of the plugin. The structure of the `mapping` block is:

```yaml
sci-embodied:
  method: SciEmbodied
  path: 'builtins'
  mapping:
    'parameter-name-in-the-plugin': 'parameter-name-in-the-input'
```

### Inputs

- `device/emissions-embodied`: The total embodied emissions for the component, measured in gCO2e.
- `device/expected-lifespan`: The expected lifespan of the component, in seconds.
- `resources-reserved`: The number of resources reserved for use by the software.
- `resources-total`: The total number of resources available.
- `vcpus-allocated`: The number of virtual CPUs allocated to a particular resource.
- `vcpus-total`: The total number of virtual CPUs available on a particular resource.
- `duration`: The length of time the hardware is reserved for use by the software, in seconds.

### Outputs

- `carbon-embodied`: The total embodied emissions for the component, measured in gCO2e.

## Calculation

The plugin calculates the total embodied carbon emissions using the following steps:

   - CPU emissions (`cpuE`) are calculated based on the difference between allocated vCPUs and baseline vCPUs.
   - Memory emissions (`memoryE`) are calculated based on the difference between allocated memory and baseline memory.
   - Emissions for HDD, SSD, and GPU are also calculated based on their respective differences from baseline values.
   - The total embodied emissions are calculated by summing the baseline emissions with the above components and adjusting for the lifespan and time duration.

## Implementation

The plugin can be instantiated and executed as follows:

```typescript
import {SciEmbodied} from 'builtins';

const sciEmbodied = SciEmbodied(config, parametersMetadata, {});
const results = await sciEmbodied.execute([
  {
    duration: 3600, // time reserved in seconds
    vCPUs: 2,       // allocated vCPUs
    memory: 32,     // allocated memory in GB
    ssd: 100,       // allocated SSD storage in GB
    hdd: 1000,      // allocated HDD storage in GB
    gpu: 1,         // allocated GPUs
    'total-vcpus': 8, // total available vCPUs
  },
]);

console.log(results);
```

# Example Manifest

IF users will typically call the plugin as part of a pipeline defined in a `manifest` file. In this case, instantiating the plugin is handled by `if-run` and does not have to be done explicitly by the user. The following is an example `manifest` that calls `sci-embodied`:

```yaml
name: sci-embodied
description: demo invoking sci-embodied
tags:
initialize:
  plugins:
    sci-embodied:
      method: SciEmbodied
      path: 'builtins'
      mapping:
        device/emissions-embodied: device/carbon-footprint
tree:
  children:
    child:
      pipeline:
        compute:
          - sci-embodied 
      inputs:
        - timestamp: 2024-08-19T00:00
          duration: 3600
```

To run this example manifest, use the following command:

```bash
npm i -g @grnsft/if
if-run --manifest manifests/plugins/sci-embodied/success.yml --output manifests/outputs/success.yml
```
