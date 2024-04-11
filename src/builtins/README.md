# IF builtins

There are three built-in features of IF:

- time-sync
- CSV exporter
- groupby

On this page, you can find the documentation for each of these three builtins.

## Time-sync

Time sync standardizes the start time, end time and temporal resolution of all output data across an entire tree.

### Parameters

### Plugin config

The following should be defined in the plugin initialization:

- `start-time`: global start time as ISO 8061 string
- `stop`: global end time as ISO 8061 string
- `interval`: temporal resolution in seconds
- `error-on-padding`: avoid zero/'zeroish' padding (if needed) and error out instead. `False` by defult.

#### Inputs:

- `inputs`: an array of observations

#### Returns

- `inputs`: time-synchronized version of the tree




#### Overview

A manifest file for a tree might contain many nodes each representing some different part of an application's stack or even different applications running on different machines. It is therefore common to have time series data in each component that is not directly comparable to other components either because the temporal resolution of the data is different, they cover different periods, or there are gaps in some records (e.g. some apps might burst but then go dormant, while others run continuously). This makes post-hoc visualization, analysis and aggregation of data from groups of nodes difficult to achieve. To address this, we created a time synchronization plugin that takes in non-uniform times series and snaps them all to a regular timeline with uniform start time, end time and temporal resolution.

We do this by implementing the following logic:

- Shift readings to nearest whole seconds
- Upsample the time series to a base resolution (1s)
- Resample to desired resolution by batching 1s entries
- Extrapolate or trim to ensure all time series share global start and end dates

The next section explains each stage in more detail.

#### Details

##### Upsampling rules

A set of `inputs` is naturally a time series because all `observations` include a `timestamp` and a `duration`, measured in seconds.
For each `observation` in `inputs` we check whether the duration is greater than 1 second. If `duration` is greater than 1 second, we create N new `observation` objects, where N is equal to `duration`. This means we have an `observation` for every second between the initial timestamp and the end of the observation period. Each new object receives a timestamp incremented by one second.

This looks as follows:

```ts
[{timestamp: '2023-12-12T00:00:00.000Z', duration: 5}]

# becomes
[
  {timestamp: '2023-12-12T00:00:01.000Z', duration: 1}
  {timestamp: '2023-12-12T00:00:02.000Z', duration: 1}
  {timestamp: '2023-12-12T00:00:03.000Z', duration: 1}
  {timestamp: '2023-12-12T00:00:04.000Z', duration: 1}
  {timestamp: '2023-12-12T00:00:05.000Z', duration: 1}
]
```

Each `observation` actually includes many key-value pairs. The precise content of the `observation` is not known until runtime because it depends on which plugins have been included in the pipeline. Different values have to be treated differently when we upsample in time. The method we use to upsample depends on the `aggregation-method` defined for each key in `units.yml`.

If the right way to aggregate a value is to sum it, then the right way to upsample it is to divide by `duration`, effectively spreading the total out evenly across the new, higher resolution, `observations` so that the total across the same bucket of time is unchanged (i.e. if the total for some value is 10 when there is one entry with `duration = 10s`, then the total should still be 10 when there are 10 entries each witch `duration = 1s`).

On the other hand, if the right way to aggregate a value is to take its average over some time period, the value should be copied unchanged into the newly upsampled `observations`. This is appropriate for values that are proportional or percentages, such as `cpu/utilization`. Treating these values as constants means the average over the `duration` for an observation is identical whether you consider the initial `observation` or the upsampled set of N `observation`s.

Constants can simply be copied as-is, because they are constants. Examples might be the `grid/carbon-intensity` - this value does not change depending on how frequently you observe it.

Therefore, we apply this logic and the resulting flow looks as follows (the `aggregation-method` for `carbon` and `energy` is `sum`, `grid/carbon-intensity` is a constant and `cpu/utilization` is expressed as a percentage):

```ts
[{timestamp: '2023-12-12T00:00:00.000Z', duration: 5, 'cpu/utilization': 12, carbon: 5, energy: 10, 'grid/carbon-intensity': 471}]

# becomes

[
    {timestamp: '2023-12-12T00:00:00.000Z', duration: 1, 'cpu/utilization': 12, carbon: 1, energy: 2, 'grid/carbon-intensity': 471},
    {timestamp: '2023-12-12T00:00:01.000Z', duration: 1, 'cpu/utilization': 12, carbon: 1, energy: 2, 'grid/carbon-intensity': 471},
    {timestamp: '2023-12-12T00:00:02.000Z', duration: 1, 'cpu/utilization': 12, carbon: 1, energy: 2, 'grid/carbon-intensity': 471},
    {timestamp: '2023-12-12T00:00:03.000Z', duration: 1, 'cpu/utilization': 12, carbon: 1, energy: 2, 'grid/carbon-intensity': 471},
    {timestamp: '2023-12-12T00:00:04.000Z', duration: 1, 'cpu/utilization': 12, carbon: 1, energy: 2, 'grid/carbon-intensity': 471},
    {timestamp: '2023-12-12T00:00:05.000Z', duration: 1, 'cpu/utilization': 12, carbon: 1, energy: 2, 'grid/carbon-intensity': 471}
]
```

The end result is that for each `observation`, we upsample the time series to yield 1 second resolution data between `timestamp` and `timestamp + duration`.

##### Gap-filling

Sometimes there might be discontinuities in the time series between one `observation` and another. For example we might have two `observations` in a set of `inputs` that have timestamps spaced 10 seconds apart, but the `duration` of the first `observation` is only 5 seconds. in this case, 5 seconds of data are unaccounted for and create a discontinuity in the time series.

To solve this problem, for all but the first `observation` in the `inputs` array, we grab the `timestamp` and `duration` from the previous `observation` and check that `timestamp[N] + duration[N] == timestamp[N+1]`. If this condition is not satisfied, we backfill the missing data with a "zero-observation" which is identical to the surrounding observations except any values whose `aggregation-method` is `sum` are set to zero. This is equivalent to assuming that when there is no data available, the app being monitored is switched off.

The end result of this gap-filling is that we have continuous 1 second resolution data that can be resampled to a new temporal resolution.

```ts
[
    {timestamp: '2023-12-12T00:00:00.000Z', duration: 5, 'cpu/utilization': 12, carbon: 5, energy: 10, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:08.000Z', duration: 2, 'cpu/utilization': 12, carbon: 5, energy: 10, grid/carbon-intensity: 471}
]

# There are 2 seconds of missing data between the end of timestamp[0] + duration, and timestamp[1]
# After expansion and infilling, the array becomes:

[
    {timestamp: '2023-12-12T00:00:00.000Z', duration: 1, 'cpu/utilization': 12, carbon: 1, energy: 2, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:01.000Z', duration: 1, 'cpu/utilization': 12, carbon: 1, energy: 2, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:02.000Z', duration: 1, 'cpu/utilization': 12, carbon: 1, energy: 2, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:03.000Z', duration: 1, 'cpu/utilization': 12, carbon: 1, energy: 2, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:04.000Z', duration: 1, 'cpu/utilization': 12, carbon: 1, energy: 2, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:05.000Z', duration: 1, 'cpu/utilization': 12, carbon: 1, energy: 2, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:06.000Z', duration: 1, 'cpu/utilization': 0, carbon: 0, energy: 0, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:07.000Z', duration: 1, 'cpu/utilization': 0, carbon: 0, energy: 0, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:08.000Z', duration: 1, 'cpu/utilization': 12, carbon: 2.5, energy: 5, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:09.000Z', duration: 1, 'cpu/utilization': 12, carbon: 2.5, energy: 5, grid/carbon-intensity: 471}
]
```

Note that when `error-on-padding` is `true` no gap-filling is performed and the plugin will error out instead.

##### Trimming and padding

To ensure parity across all the components in a tree, we need to synchronize the start and end times for all time series. To do this, we pass the `time-sync` plugin plugin some global config: `startTime`, `endTime` and `interval`. The `startTime` is the timestamp where _all_ input arrays across the entire tree should begin, and `endTime` is the timestamp where _all_ input arrays across the entire tree should end. `interval` is the time resolution we ultimately want to resample to.

To synchronize the time series start and end we check the first element of `inputs` for each node in the tree and determine whether it is earlier, later or equal to the global start time. If it is equal then no action is required. If the `input` start time is earlier than the global start time, we simply discard entries from the front of the array until the start times are aligned. If the `input` start time is after the global start time, then we pad with our "zero-observation" object - one for every second separating the global start time from the `input` start time. The same process is repeated for the end time - we either trim away `input` data or pad it out with "zero-observation" objects.

For example, for `startTime = 2023-12-12T00:00:00.000Z` and `endTime = 2023-12-12T00:00:15.000Z`:

```ts
[
    {timestamp: '2023-12-12T00:00:05.000Z', duration: 5, 'cpu/utilization': 12, carbon: 5, energy: 10, 'grid/carbon-intensity': 471},
]

# There are 5 seconds missing from the start and end. After padding, the array becomes:

[
    {timestamp: '2023-12-12T00:00:00.000Z', duration: 1, 'cpu/utilization': 0, carbon: 0, energy: 0, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:01.000Z', duration: 1, 'cpu/utilization': 0, carbon: 0, energy: 0, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:02.000Z', duration: 1, 'cpu/utilization': 0, carbon: 0, energy: 0, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:03.000Z', duration: 1, 'cpu/utilization': 0, carbon: 0, energy: 0, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:04.000Z', duration: 1, 'cpu/utilization': 0, carbon: 0, energy: 0, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:05.000Z', duration: 1, 'cpu/utilization': 12, carbon: 1, energy: 2, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:06.000Z', duration: 1, 'cpu/utilization': 12, carbon: 1, energy: 2, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:07.000Z', duration: 1, 'cpu/utilization': 12, carbon: 1, energy: 2, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:08.000Z', duration: 1, 'cpu/utilization': 12, carbon: 1, energy: 2, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:09.000Z', duration: 1, 'cpu/utilization': 12, carbon: 1, energy: 2, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:10.000Z', duration: 1, 'cpu/utilization': 0, carbon: 0, energy: 0, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:11.000Z', duration: 1, 'cpu/utilization': 0, carbon: 0, energy: 0, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:12.000Z', duration: 1, 'cpu/utilization': 0, carbon: 0, energy: 0, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:13.000Z', duration: 1, 'cpu/utilization': 0, carbon: 0, energy: 0, grid/carbon-intensity: 471},
    {timestamp: '2023-12-12T00:00:14.000Z', duration: 1, 'cpu/utilization': 0, carbon: 0, energy: 0, grid/carbon-intensity: 471},

]
```

Note that when `error-on-padding` is `true` no padding is performed and the plugin will error out instead.

##### Resampling rules

Now we have synchronized, continuous, high resolution time series data, we can resample. To achieve this, we use `interval`, which sets the global temporal resolution for the final, processed time series. `intervalk` is expressed in units of seconds, which means we can simply batch `observations` together in groups of size `interval`. For each value in each object we either sum, average or copy the values into one single summary object representing each time bucket of size `interval` depending on their `aggregation-method` defined in `params.ts`. The returned array is the final, synchronized time series at the desired temporal resolution.


#### Assumptions and limitations

To do time synchronization, we assume:

- There is no environmental impact for an application when there is no data available.
- Evenly distributing the total for a `duration` across higher resolution `observations` is appropriate, as opposed to having some non-uniform distribution.


### Typescript implementation


To run the plugin, you must first create an instance of `TimeSync`.
Then, you can call `execute()`.

```typescript
const globalConfig = {
  'start-time': '2023-12-12T00:00:00.000Z',
  'end-time': '2023-12-12T00:00:30.000Z',
  interval: 10
}
const timeSync = TimeSync(globalConfig);
const results = timeSync.execute([
  {
    timestamp: '2023-12-12T00:00:00.000Z'
    duration: 10
    'cpu/utilization': 10
    carbon: 100
    energy: 100
    requests: 300
  },
  {
    timestamp: '2023-12-12T00:00:10.000Z'
    duration: 10
    'cpu/utilization': 20
    carbon: 100,
    energy: 100,
    requests: 380
  }
])
```

### Example manifest

IF users will typically call the plugin as part of a pipeline defined in an `manifest`
file. In this case, instantiating and configuring the plugin is handled by
`ie` and does not have to be done explicitly by the user.
The following is an example `manifest` that calls `time-sync`:

```yaml
name: time-sync-demo
description: impl with 2 levels of nesting with non-uniform timing of observations
tags:
initialize:
  plugins:
    teads-curve:
      method: TeadsCurve
      path: '@grnsft/if-unofficial-plugins'
    sci-e:
      method: SciE
      path: '@grnsft/if-plugins'
    sci-m:
      path: '@grnsft/if-plugins'
      method: SciM
    sci-o:
      method: SciO
      path: '@grnsft/if-plugins'
    time-sync:
      method: TimeSync
      path: builtin
      global-config:
        start-time: '2023-12-12T00:00:00.000Z' # ISO timestamp
        end-time: '2023-12-12T00:01:00.000Z' # ISO timestamp
        interval: 5 # seconds
tree:
  children:
    child: # an advanced grouping node
      pipeline:
        - teads-curve
        - sci-e
        - sci-m
        - sci-o
        - time-sync
      config:
        teads-curve:
          cpu/thermal-design-power: 65
        sci-m:
          device/emissions-embodied: 251000 # gCO2eq
          time-reserved: 3600 # 1 hour in s
          device/expected-lifespan: 126144000 # 4 years in seconds
          resources-reserved: 1
          resources-total: 1
        sci-o:
          grid/carbon-intensity: 457 # gCO2/kwh
      children:
        child-1:
          inputs:
            - timestamp: '2023-12-12T00:00:00.000Z'
              duration: 10
              cpu/utilization: 10
              carbon: 100
              energy: 100
              requests: 300
            - timestamp: '2023-12-12T00:00:10.000Z'
              duration: 10
              cpu/utilization: 20
              carbon: 200
              energy: 200
              requests: 380
```


## CSV Exporter 

IF supports exporting data to CSV files. This provides users with a data format that enables visualization and data analysis using standard data analysis tools.

### Manifest config

To export your data to a CSV file, you have to provide a small piece of config data to your manifest file:

```yaml
initialize:
  outputs:
    - csv
```

You can also add `- yaml` if you want to export to both `yaml` and `csv` simultaneously.

### CLI command

Then, you must select the metric you want to export to CSV. The name of that metric must be added to the savepath provided to the `--output` command in the CLI, after a hashtag.

For example, to export the `carbon` data from your tree to a CSV file:

```sh
ie --manifest example.yml --output example#carbon
```

This will save a CSV file called `example.csv`. The contents will look similar to the following:

|                                                |                  |                              |                              |                              |
| ---------------------------------------------- | ---------------- | ---------------------------- | ---------------------------- | ---------------------------- |
| **Path**                                       | **Aggregated**   | **2024-03-05T00:00:00.000Z** | **2024-03-05T00:05:00.000Z** | **2024-03-05T00:10:00.000Z** |
| tree.carbon                                    | 425.289232008725 | 17.9269877157543             | 8.9024388783018              | 45.6021901509012             |
| tree.children.westus3.carbon                   | 104.696836722878 | 3.59973803197887             | 3.47438149032372             | 6.91318436533634             |
| tree.children.westus3.children.server-1.carbon | 104.696836722878 | 3.59973803197887             | 3.47438149032372             | 6.91318436533634             |
| tree.children.france.carbon                    | 320.592395285847 | 14.3272496837754             | 5.42805738797808             | 38.6890057855649             |
| tree.children.france.children.server-2.carbon  | 320.592395285847 | 14.3272496837754             | 5.42805738797808             | 38.6890057855649             |


### Comparing CSV to Yaml

The CSV above is generated from the following yaml. The `carbon` metric is extracted and added to the CSV. Otherwise, the CSV is an exact representation of the following yaml tree. You can see that the CSV representation is *much* easier to understand than the full yaml tree:

```yaml
tree:
  pipeline:
    - mock-observations
    - group-by
    - cloud-metadata
    - time-sync
    - watttime
    - teads-curve
    - operational-carbon
  defaults:
    grid/carbon-intensity: 500
  config:
    group-by:
      group:
        - cloud/region
        - name
  children:
    westus3:
      children:
        server-1:
          inputs:
            - timestamp: '2024-03-05T00:00:00.000Z'
              duration: 300
              name: server-1
              cloud/instance-type: Standard_E64_v3
              cloud/region: westus3
              cloud/vendor: azure
              cpu/utilization: 66
              grid/carbon-intensity: 500
            - timestamp: '2024-03-05T00:05:00.000Z'
              duration: 300
              name: server-1
              cloud/instance-type: Standard_E64_v3
              cloud/region: westus3
              cloud/vendor: azure
              cpu/utilization: 4
              grid/carbon-intensity: 500
            - timestamp: '2024-03-05T00:10:00.000Z'
              duration: 300
              name: server-1
              cloud/instance-type: Standard_E64_v3
              cloud/region: westus3
              cloud/vendor: azure
              cpu/utilization: 54
              grid/carbon-intensity: 500
            - timestamp: '2024-03-05T00:15:00.000Z'
              duration: 300
              name: server-1
              cloud/instance-type: Standard_E64_v3
              cloud/region: westus3
              cloud/vendor: azure
              cpu/utilization: 19
              grid/carbon-intensity: 500
          outputs:
            - timestamp: '2024-03-05T00:00:00.000Z'
              duration: 300
              name: server-1
              cloud/instance-type: Standard_E64_v3
              cloud/region: westus3
              cloud/vendor: azure
              cpu/utilization: 65.78
              grid/carbon-intensity: 369.4947514218548
              vcpus-allocated: 64
              vcpus-total: 64
              memory-available: 432
              physical-processor: >-
                Intel® Xeon® Platinum 8370C,Intel® Xeon® Platinum 8272CL,Intel®
                Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz
              cpu/thermal-design-power: 269.1
              cloud/region-cfe: CAISO
              cloud/region-em-zone-id: US-CAL-CISO
              cloud/region-wt-id: CAISO_NORTH
              cloud/region-location: US West (N. California)
              cloud/region-geolocation: 34.0497,-118.1326
              geolocation: 34.0497,-118.1326
              cpu/energy: 0.018934842060004835
              carbon: 6.996324760173567
            - timestamp: '2024-03-05T00:05:00.000Z'
              duration: 300
              name: server-1
              cloud/instance-type: Standard_E64_v3
              cloud/region: westus3
              cloud/vendor: azure
              cpu/utilization: 3.986666666666667
              grid/carbon-intensity: 369.38452029076234
              vcpus-allocated: 64
              vcpus-total: 64
              memory-available: 432
              physical-processor: >-
                Intel® Xeon® Platinum 8370C,Intel® Xeon® Platinum 8272CL,Intel®
                Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz
              cpu/thermal-design-power: 269.1
              cloud/region-cfe: CAISO
              cloud/region-em-zone-id: US-CAL-CISO
              cloud/region-wt-id: CAISO_NORTH
              cloud/region-location: US West (N. California)
              cloud/region-geolocation: 34.0497,-118.1326
              geolocation: 34.0497,-118.1326
              cpu/energy: 0.004545546617763956
              carbon: 1.6790545568620359
            - timestamp: '2024-03-05T00:10:00.000Z'
              duration: 300
              name: server-1
              cloud/instance-type: Standard_E64_v3
              cloud/region: westus3
              cloud/vendor: azure
              cpu/utilization: 53.82
              grid/carbon-intensity: 372.58122309244305
              vcpus-allocated: 64
              vcpus-total: 64
              memory-available: 432
              physical-processor: >-
                Intel® Xeon® Platinum 8370C,Intel® Xeon® Platinum 8272CL,Intel®
                Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz
              cpu/thermal-design-power: 269.1
              cloud/region-cfe: CAISO
              cloud/region-em-zone-id: US-CAL-CISO
              cloud/region-wt-id: CAISO_NORTH
              cloud/region-location: US West (N. California)
              cloud/region-geolocation: 34.0497,-118.1326
              geolocation: 34.0497,-118.1326
              cpu/energy: 0.017357893372978016
              carbon: 6.467225143212361
            - timestamp: '2024-03-05T00:15:00.000Z'
              duration: 300
              name: server-1
              cloud/instance-type: Standard_E64_v3
              cloud/region: westus3
              cloud/vendor: azure
              cpu/utilization: 18.936666666666667
              grid/carbon-intensity: 434.20042537311633
              vcpus-allocated: 64
              vcpus-total: 64
              memory-available: 432
              physical-processor: >-
                Intel® Xeon® Platinum 8370C,Intel® Xeon® Platinum 8272CL,Intel®
                Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz
              cpu/thermal-design-power: 269.1
              cloud/region-cfe: CAISO
              cloud/region-em-zone-id: US-CAL-CISO
              cloud/region-wt-id: CAISO_NORTH
              cloud/region-location: US West (N. California)
              cloud/region-geolocation: 34.0497,-118.1326
              geolocation: 34.0497,-118.1326
              cpu/energy: 0.010385485956624245
              carbon: 4.5093824200727735
          aggregated:
            carbon: 19.651986880320734
      outputs:
        - carbon: 6.996324760173567
          timestamp: '2024-03-05T00:00:00.000Z'
          duration: 300
        - carbon: 1.6790545568620359
          timestamp: '2024-03-05T00:05:00.000Z'
          duration: 300
        - carbon: 6.467225143212361
          timestamp: '2024-03-05T00:10:00.000Z'
          duration: 300
        - carbon: 4.5093824200727735
          timestamp: '2024-03-05T00:15:00.000Z'
          duration: 300
      aggregated:
        carbon: 19.651986880320734
    france:
      children:
        server-2:
          inputs:
            - timestamp: '2024-03-05T00:00:00.000Z'
              duration: 300
              name: server-2
              cloud/instance-type: Standard_E64_v3
              cloud/region: france
              cloud/vendor: azure
              cpu/utilization: 15
              grid/carbon-intensity: 500
            - timestamp: '2024-03-05T00:05:00.000Z'
              duration: 300
              name: server-2
              cloud/instance-type: Standard_E64_v3
              cloud/region: france
              cloud/vendor: azure
              cpu/utilization: 78
              grid/carbon-intensity: 500
            - timestamp: '2024-03-05T00:10:00.000Z'
              duration: 300
              name: server-2
              cloud/instance-type: Standard_E64_v3
              cloud/region: france
              cloud/vendor: azure
              cpu/utilization: 16
              grid/carbon-intensity: 500
            - timestamp: '2024-03-05T00:15:00.000Z'
              duration: 300
              name: server-2
              cloud/instance-type: Standard_E64_v3
              cloud/region: france
              cloud/vendor: azure
              cpu/utilization: 6
              grid/carbon-intensity: 500
          outputs:
            - timestamp: '2024-03-05T00:00:00.000Z'
              duration: 300
              name: server-2
              cloud/instance-type: Standard_E64_v3
              cloud/region: france
              cloud/vendor: azure
              cpu/utilization: 14.95
              grid/carbon-intensity: 1719.1647205176753
              vcpus-allocated: 64
              vcpus-total: 64
              memory-available: 432
              physical-processor: >-
                Intel® Xeon® Platinum 8370C,Intel® Xeon® Platinum 8272CL,Intel®
                Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz
              cpu/thermal-design-power: 269.1
              cloud/region-cfe: France
              cloud/region-em-zone-id: FR
              cloud/region-wt-id: FR
              cloud/region-location: Paris
              cloud/region-geolocation: 48.8567,2.3522
              geolocation: 48.8567,2.3522
              cpu/energy: 0.00905914075141129
              carbon: 15.574155178030272
            - timestamp: '2024-03-05T00:05:00.000Z'
              duration: 300
              name: server-2
              cloud/instance-type: Standard_E64_v3
              cloud/region: france
              cloud/vendor: azure
              cpu/utilization: 77.74
              grid/carbon-intensity: 1719.0544893865829
              vcpus-allocated: 64
              vcpus-total: 64
              memory-available: 432
              physical-processor: >-
                Intel® Xeon® Platinum 8370C,Intel® Xeon® Platinum 8272CL,Intel®
                Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz
              cpu/thermal-design-power: 269.1
              cloud/region-cfe: France
              cloud/region-em-zone-id: FR
              cloud/region-wt-id: FR
              cloud/region-location: Paris
              cloud/region-geolocation: 48.8567,2.3522
              geolocation: 48.8567,2.3522
              cpu/energy: 0.020379266251888902
              carbon: 35.0330691407141
            - timestamp: '2024-03-05T00:10:00.000Z'
              duration: 300
              name: server-2
              cloud/instance-type: Standard_E64_v3
              cloud/region: france
              cloud/vendor: azure
              cpu/utilization: 15.946666666666667
              grid/carbon-intensity: 1718.8707708347622
              vcpus-allocated: 64
              vcpus-total: 64
              memory-available: 432
              physical-processor: >-
                Intel® Xeon® Platinum 8370C,Intel® Xeon® Platinum 8272CL,Intel®
                Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz
              cpu/thermal-design-power: 269.1
              cloud/region-cfe: France
              cloud/region-em-zone-id: FR
              cloud/region-wt-id: FR
              cloud/region-location: Paris
              cloud/region-geolocation: 48.8567,2.3522
              geolocation: 48.8567,2.3522
              cpu/energy: 0.009405866514354337
              carbon: 16.16746902589712
            - timestamp: '2024-03-05T00:15:00.000Z'
              duration: 300
              name: server-2
              cloud/instance-type: Standard_E64_v3
              cloud/region: france
              cloud/vendor: azure
              cpu/utilization: 5.98
              grid/carbon-intensity: 1718.6686804277592
              vcpus-allocated: 64
              vcpus-total: 64
              memory-available: 432
              physical-processor: >-
                Intel® Xeon® Platinum 8370C,Intel® Xeon® Platinum 8272CL,Intel®
                Xeon® 8171M 2.1 GHz,Intel® Xeon® E5-2673 v4 2.3 GHz
              cpu/thermal-design-power: 269.1
              cloud/region-cfe: France
              cloud/region-em-zone-id: FR
              cloud/region-wt-id: FR
              cloud/region-location: Paris
              cloud/region-geolocation: 48.8567,2.3522
              geolocation: 48.8567,2.3522
              cpu/energy: 0.0054492484351820105
              carbon: 9.365452617417297
          aggregated:
            carbon: 76.1401459620588
      outputs:
        - carbon: 15.574155178030272
          timestamp: '2024-03-05T00:00:00.000Z'
          duration: 300
        - carbon: 35.0330691407141
          timestamp: '2024-03-05T00:05:00.000Z'
          duration: 300
        - carbon: 16.16746902589712
          timestamp: '2024-03-05T00:10:00.000Z'
          duration: 300
        - carbon: 9.365452617417297
          timestamp: '2024-03-05T00:15:00.000Z'
          duration: 300
      aggregated:
        carbon: 76.1401459620588
  outputs:
    - carbon: 22.57047993820384
      timestamp: '2024-03-05T00:00:00.000Z'
      duration: 300
    - carbon: 36.71212369757613
      timestamp: '2024-03-05T00:05:00.000Z'
      duration: 300
    - carbon: 22.63469416910948
      timestamp: '2024-03-05T00:10:00.000Z'
      duration: 300
    - carbon: 13.87483503749007
      timestamp: '2024-03-05T00:15:00.000Z'
      duration: 300
  aggregated:
    carbon: 95.79213284237952
```

### CSV and aggregation

The CSV representation of the output data is helpful for intuiting how the aggregation procedure works. What we refer to as "horizontal" aggregation is really an aggregation of the *rows* of the CSV. You can replicate the IF aggregation function by summing the cells in each row of the CSV. Similarly, what we refer to as "vertical" aggregation can be replicated by summing the *columns* in the CSV representation (this is not *exactly* accurate because you have to skip summing both parent nodes and their children, both of which are represented in the CSV, but it is true conceptually).


## Groupby

Groupby is an IF plugin that reorganizes a tree according to keys provided by the user. This allows users to regroup their observations according to various properties of their application. For example, the following manifest file contains a flat array of observations. This is how you might expect data to arrive from an importer plugin, maybe one that hits a metrics API for a cloud service.


```yaml
name: if-demo
description: demo pipeline
graph:
  children:
    my-app:
      pipeline:     
        - group-by
        - teads-curve
      config:
        group-by:
          - cloud/region
          - instance-type
      inputs:
        - timestamp: 2023-07-06T00:00
          duration: 300
          instance-type: A1
          cloud/region: uk-west
          cpu-util: 99
        - timestamp: 2023-07-06T05:00
          duration: 300
          instance-type: A1
          cloud/region: uk-west
          cpu-util: 23
        - timestamp: 2023-07-06T10:00
          duration: 300
          instance-type: A1
          cloud/region: uk-west
          cpu-util: 12
        - timestamp: 2023-07-06T00:00 # note this time restarts at the start timstamp
          duration: 300 
          instance-type: B1
          cloud/region: uk-west
          cpu-util: 11
        - timestamp: 2023-07-06T05:00
          duration: 300
          instance-type: B1
          cloud/region: uk-west
          cpu-util: 67
        - timestamp: 2023-07-06T10:00
          duration: 300 
          instance-type: B1
          cloud/region: uk-west
          cpu-util: 1
```

However, each observation contains an `instance-type` field that varies between observations. There are two instance types being represented in this array of observations. This means there are duplicate entries for the same timestamp in this array. This is the problem that `group-by` solves. You provide `instance-type` as a key to the `group-by` plugin and it extracts the data belonging to the different instances and separates them into independent arrays. The above example would be restructured so that instance types `A1` and `B1` have their own data, as follows:

```yaml
graph:
  children:
    my-app:
      pipeline:
        # - group-by
        - teads-curve
      config:
        group-by:
          groups:
            - cloud/region
            - instance-type
      children:
        A1:
            inputs:
            - timestamp: 2023-07-06T00:00
                duration: 300
                instance-type: A1
                cloud/region: uk-west
                cpu-util: 99
            - timestamp: 2023-07-06T05:00
                duration: 300
                instance-type: A1
                cloud/region: uk-west
                cpu-util: 23
            - timestamp: 2023-07-06T10:00
                duration: 300
                instance-type: A1
                cloud/region: uk-west
                cpu-util: 12
        B1:
            inputs:
            - timestamp: 2023-07-06T00:00
                duration: 300
                instance-type: B1
                cloud/region: uk-east
                cpu-util: 11
            - timestamp: 2023-07-06T05:00
                duration: 300
                instance-type: B1
                cloud/region: uk-east
                cpu-util: 67
            - timestamp: 2023-07-06T10:00
                duration: 300
                instance-type: B1
                cloud/region: uk-east
                cpu-util: 1
```

### Using `group-by`

To use `group-by`, you have to initialize it as a plugin and invoke it in a pipeline.

The initialization looks as follows:

```yaml
initialize:
plugins:
group-by:
  path: 'builtin'
  method: GroupBy
```

You then have to provide config defining which keys to group by in each component. This is done at the component level (i.e. not global config).
For example:


```yaml
tree:
  children:
    my-app:
      pipeline:
        - group-by
      config:
        group-by:
          group:
            - cloud/region
            - instance-type
```

In the example above, the plugin would regroup the input data for the specific component by `cloud/region` and by `instance-type`.

Assuming the values `A1` and `B1` are found for `instance-type` and the values `uk-east` and `uk-west` are found for `cloud/region`, the result of `group-by` would look similar to the following:

```yaml
tree:
  children:
    my-app:
      pipeline:
        - group-by
      config:
        group-by:
          groups:
            - cloud/region
            - instance-type
      children:
        uk-west:
          children:
            A1:
              inputs:
                - timestamp: 2023-07-06T00:00
                  duration: 300
                  instance-type: A1
                  cloud/region: uk-west
                  cpu-util: 99
                - timestamp: 2023-07-06T05:00
                  duration: 300
                  instance-type: A1
                  cloud/region: uk-west
                  cpu-util: 23
                - timestamp: 2023-07-06T10:00
                  duration: 300
                  instance-type: A1
                  cloud/region: uk-west
                  cpu-util: 12
        uk-east:
          children:
            B1:
              inputs:
                - timestamp: 2023-07-06T00:00
                  duration: 300
                  instance-type: B1
                  cloud/region: uk-east
                  cpu-util: 11
                - timestamp: 2023-07-06T05:00
                  duration: 300
                  instance-type: B1
                  cloud/region: uk-east
                  cpu-util: 67
                - timestamp: 2023-07-06T10:00
                  duration: 300
                  instance-type: B1
                  cloud/region: uk-east
                  cpu-util: 1
```

This reorganized data can then be used to feed the rest of a computation pipeline.
