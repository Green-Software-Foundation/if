# SCI-Embodied

Software systems cause emissions through the hardware that they operate on, both through the energy that the physical hardware consumes and the emissions associated with manufacturing the hardware. Embodied carbon refers to the carbon emitted during the manufacture and eventual disposal of a component. It is added to the operational carbon (carbon emitted when a component is used) to give an overall SCI score.

Read more on [embodied carbon](https://github.com/Green-Software-Foundation/sci/blob/main/Software_Carbon_Intensity/Software_Carbon_Intensity_Specification.md#embodied-emissions).

Our plugin follows the Cloud Carbon Footprint methodology for calculating embodied carbon and extends it to scale down the total embodied carbon for a piece of hardware by the portion of it that should be allocated to a particular application, using a `usage-ratio` and `time`. The `usage-ratio` is a term that can be used to scale by, for example, the storage you actually use on a shared server, rather than the total storage available for that hardware, or the time you are active compared to the hardware lifespan.


## Parameters

### Plugin Configuration

The `SciEmbodied` plugin requires a configuration object and parameter metadata (optional) to do the calculation.

### Plugin Parameter Metadata

The `parameter-metadata` section contains information about the `description`, `unit`, and `aggregation-method` of the input and output parameters.

- `inputs`: Describes the parameters for the input data. Each parameter includes:
  - `description`: A brief description of the parameter.
  - `unit`: The unit of measurement for the parameter.
  - `aggregation-method`: The method used to aggregate this parameter (`sum`, `avg`, or `none`).

- `outputs`: Describes the `embodied-carbon` parameter, which includes:
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

### Config

`baseline-vcpus`: the number of CPUs to use in the baseline server, defaults tothe CCF value of 1,
`baseline-memory`: the amount of memory to use in the baseline server, defaults tothe CCF value of 16,
`baseline-emissions`: the embodied carbon assumed to represent a baseline server, in g
`lifespan`: the lifespan of the device, in seconds. Defaults to 4 years (126144000 seconds),
`time`: the time to consider when scaling the total device embodied carbon, if not given defaults to `duration`
`vcpu-emissions-constant`: emissions for a CPU in gCO2e. Defaults tothe CCF value (100000),
`memory-emissions-constant`: value used in calculating emissions due to memory, defaults to the CCf value of 533/384
`ssd-emissions-constant`: emissions for a SSD in gCO2e. Defaults tothe CCF value (50000),
`hdd-emissions-constant`: emissions for a CPU in gCO2e. Defaults tothe CCF value (100000),
`gpu-emissions-constant`: emissions for a GPU in gCO2e. Defaults tothe CCF value (150000),
`output-parameter`: name to give the output value, defaults to `embodied-carbon`

Note that if you do not provide any config at all, we will fallback to defaults for everything, equivalent to setting the baseline server equal to the CCF version, which has 1000000g of embodied emissions.

### Inputs

- `vCPUs`: number of CPUs available on device
- `memory`: amount of RAM available on device, in GB
- `ssd`: number of SSD drives mounted on device
- `hdd`: number of HDD drives mounted on device
- `gpu`: number of GPUs available on device
- `duration`: The length of time the hardware is reserved for use by the software, in seconds.
- `time`: the time to use for scalign the total embodied carbon per timestap, if you do not want to use `duration`
- `usage-ratio`: the ratio by which to scale down the total embodied carbon according to your usage, e.g. for a shared storage server the total storage divided by your actual storage.

Note that if you do not provide any inputs at all, we fall back to defaults that are equivalent to using the full resources of the baseline server, scaled only by `duration`.

### Outputs

- `embodied-carbon`: The total embodied emissions for the component, measured in gCO2e, per timestep.

## Calculation

The plugin calculates the total embodied carbon emissions using the following steps:

   - CPU emissions (`cpuE`) are calculated based on the difference between allocated vCPUs and baseline vCPUs.
   - Memory emissions (`memoryE`) are calculated based on the difference between allocated memory and baseline memory.
   - Emissions for HDD, SSD, and GPU are also calculated based on their respective differences from baseline values.
   - The total embodied emissions are calculated by summing the baseline emissions with the above components scaling by the usage ratio and time.

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
