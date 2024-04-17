# Interpolation Plugin

## Overview

Interpolation is a way to infer new data points from a previously known set of points.
This plugin implements linear interpolation by default for estimating energy consumption using the TDP of a chip.

## Usage

To employ the `Interpolation` plugin, adhere to these steps:

1. **Initialize Plugin**: Import the `Interpolation` function and initialize it with global configuration parameters `method`, `x` and `y`.

2. **Execute Plugin**: Invoke the `execute` method of the initialized plugin instance with an array of input parameters. Each input parameter should include a `timestamp`, `duration`, `cpu/utilization` and `cpu/thermal-design-power` information.

3. **Result**: The plugin will return an array of plugin parameters enriched with the calculated average carbon intensity (`cpu/energy`) for each input.

## Global Config

- `method`: specifies the interpolation method for the data. Acceptable values are 'linear', 'spline', or 'polynomial'. The default method is linear. (optional)
- `x`: array of x points. Numbers should be in ascending order (required).
- `y`: array of y points. Numbers should be in ascending order (required).

Counts of `x` and `y` arrays elements should be equal.

## Input Parameters

The plugin expects the following input parameters:

- `timestamp`: a timestamp for the input (required)
- `duration`: the amount of time, in seconds, that the input covers. (required)
- `cpu/utilization`: percentage of the CPU utilization for the given time period (required)
- `cpu/thermal-design-power`: the TDp of the processor (required)
- `vcpus-allocated`: number of allocated virtual CPUs (optional)
- `vcpus-total`: number of total virtual CPUs (optional)

If `vcpus-allocated` and `vcpus-total` are provided, these data will be used to scale the CPU energy usage.

## Output

The plugin returns an array of objects with the same input parameters along with the calculated energy consumption for each input. The energy consumption is added as a new property `cpu/energy` in kWh units.

## Error Handling

The plugin conducts input validation using the `zod` library and may throw errors if the provided parameters are invalid.

## Plugin Algorithm

1. **Execution**:

   - Validate Global config

     - `method` - validates if the method is one of these methods: `linear`, `spline`, or `polynomial`. If the method isn’t provided, it sets to `linear`.
     - `x` and `y` should be arrays of numbers, the length should be equal, and elements should be ordered in the ascendant order.

   - Iterate through each input, and do corresponding validation and calculation.

   - Validate input parameters

     - `duration` - validate if the duration is a number
     - `timestamp` - should be in string or date format
     - `cpu/utilization` - should be 0-100 range number
     - `cpu/thermal-design-power` - should be greater than 0 number

     If the `vcpus-allocated` and `vcpus-total` are provided, the `vcpus-total` should be greater than `vcpus-allocated`. The `vcpus-allocated` should be greater than or equal to 1.

   - Calculation

     - If the `method` is provided, choose the right way to calculate. For the `linear` and `polynomial` methods, calculate according to their formulas. For spline interpolation, use the npm module `typescript-cubic-spline`.
     - If the `cpu/thermal-design-power` is provided, multiply it with the interpolation result. The result is in watts.

   The result is multiplied by the `duration` and divided by 3600 to get seconds in an hour, then divided by 1000 to get kilowatt-hours (kWh):

   `(wattage * duration) / (seconds in an hour) / 1000 = kWh`

   If `vcpus-allocated` and `vcpus-total` are provided, the result is multiplied by their division
   `energy * (vcpus-total / vcpus-allocated)`

2. **Output**: Output the provided input along with the calculated `cpu/energy`, formatted in `kWh` units.

### TypeScript Usage

```ts
const globalConfig = {
  method: 'linear',
  x: [0, 10, 50, 100],
  y: [0.12, 0.32, 0.75, 1.02],
};

const interpolationPlugin = Interpolation(globalConfig);

const inputs = [
  {
    timestamp: '2024-04-16T12:00:00Z',
    duration: 3600,
    'cpu/utilization': 45,
    'cpu/thermal-design-power': 100,
    'vcpus-allocated': 4,
    'vcpus-total': 8,
  },
];

const results = interpolationPlugin.execute(inputs);

console.log(results);
```

### Manifest Usage

#### Input

```yaml
name: interpolation-demo
description: simple demo of interpolation plugin
tags:
initialize:
  outputs:
    - yaml
  plugins:
    interpolation:
      method: Interpolation
      path: 'builtin'
      global-config:
        method: linear
        x: [0, 10, 50, 100]
        y: [0.12, 0.32, 0.75, 1.02]
tree:
  children:
    child:
      pipeline:
        - interpolation
      inputs:
        - timestamp: 2023-07-06T00:00
          duration: 3600
          cpu/utilization: 45
          cpu/thermal-design-power: 100
```

#### Output

```yaml
name: interpolation-demo
description: simple demo of interpolation plugin
tags:
initialize:
  outputs:
    - yaml
  plugins:
    interpolation:
      method: Interpolation
      path: 'builtin'
      global-config:
        method: linear
        x: [0, 10, 50, 100]
        y: [0.12, 0.32, 0.75, 1.02]
tree:
  children:
    child:
      pipeline:
        - interpolation
      inputs:
        - timestamp: 2023-07-06T00:00
          duration: 3600
          cpu/utilization: 45
          cpu/thermal-design-power: 100
      outputs:
        - timestamp: 2023-07-06T00:00
          duration: 3600
          cpu/utilization: 45
          cpu/thermal-design-power: 100
          cpu/energy: 0.069625
```

You can execute this by passing it to `ie`. Run the impact using the following command from the project root:

```sh
ie --manifest ./examples/manifests/interpolation.yml --output ./examples/outputs/interpolation.yml
```
