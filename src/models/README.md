# Time sync

Time sync standardizes the start time, end time and temporal resolution of all output data across an entire graph.

## Parameters

### Model config
The following should be defined in the model initialization:

- `start-time`: global start time as ISO 8061 string
- `stop`: global end time as ISO 8061 string
- `interval`: temporal resolution in seconds
- `error-on-padding`: avoid zero/'zeroish' padding (if needed) and error out instead. `False` by defult.

### Inputs:

- `inputs`: an array of observations
  
### Returns

- `inputs`: time-synchronized version of the graph


## Concept

### Overview

A manifest file for a graph might contain many nodes each representing some different part of an application's stack or even different applications running on different machines. It is therefore common to have time series data in each component that is not directly comparable to other components either because the temporal resolution of the data is different, they cover different periods, or there are gaps in some records (e.g. some apps might burst but then go dormant, while others run continuously). This makes post-hoc visualization, analysis and aggregation of data from groups of nodes difficult to achieve. To address this, we created a time synchronization model that takes in non-uniform times series and snaps them all to a regular timeline with uniform start time, end time and temporal resolution. 

We do this by implementing the following logic:

- Shift readings to nearest whole seconds
- Upsample the time series to a base resolution (1s) 
- Resample to desired resolution by batching 1s entries
- Extrapolate or trim to ensure all time series share global start and end dates

The next section explains each stage in more detail.

### Details

#### Upsampling rules

A set of `inputs` is naturally a time series because all `observations` include a `timestamp` and a `duration`, measured in seconds. 
For each `observation` in `inputs` we check whether the duration is greater than 1 second. If `duration` is greater than 1 second, we create N new `observation` objects, where N is equal to `duration`. This means we have an `observation` for every second between the initial timestamp and the end of the observation period. Each new object receives a timestamp incremented by one second. 

This looks as follows:

```
[{timestamp: 2023-12-12T00:00:00.000Z, duration: 5}]

# becomes
[
{timestamp: 2023-12-12T00:00:01.000Z, duration: 5}
{timestamp: 2023-12-12T00:00:02.000Z, duration: 5}
{timestamp: 2023-12-12T00:00:03.000Z, duration: 5}
{timestamp: 2023-12-12T00:00:04.000Z, duration: 5}
{timestamp: 2023-12-12T00:00:05.000Z, duration: 5}
]
```

Each `observation` actually includes many key-value pairs. The precise content of the `observation` is not known until runtime because it depends on which models have been included in the pipeline. Different values have to be treated differently when we upsample in time. The method we use to upsample depends on the `aggregation-method` defined for each key in `units.yml`. 

If the right way to aggregate a value is to sum it, then the right way to upsample it is to divide by `duration`, effectively spreading the total out evenly across the new, higher resolution, `observations` so that the total across the same bucket of time is unchanged (i.e. if the total for some value is 10 when there is one entry with `duration = 10s`, then the total should still be 10 when there are 10 entries each witch `duration = 1s`).

On the other hand, if the right way to aggregate a value is to take its average over some time period, the value should be copied unchanged into the newly upsampled `observations`. This is appropriate for values that are proportional or percentages, such as `cpu-util`. Treating these values as constants means the average over the `duration` for an observation is identical whether you consider the initial `observation` or the upsampled set of N `observation`s.

Constants can simply be copied as-is, because they are constants. Examples might be the `grid-carbon-intensity` - this value does not change depending on how frequently you observe it.

Therefore, we apply this logic and the resulting flow looks as follows (the `aggregation-method` for `carbon` and `energy` is `sum`, `grid-carbon-intensity` is a constant and `cpu-util` is expressed as a percentage):

```
[{timestamp: 2023-12-12T00:00:00.000Z, duration: 5, cpu-util: 12, carbon: 5, energy: 10, grid-carbon-intensity: 471}]

# becomes

[
    {timestamp: 2023-12-12T00:00:00.000Z, duration: 1, cpu-util: 12, carbon: 1, energy: 2, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:01.000Z, duration: 1, cpu-util: 12, carbon: 1, energy: 2, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:02.000Z, duration: 1, cpu-util: 12, carbon: 1, energy: 2, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:03.000Z, duration: 1, cpu-util: 12, carbon: 1, energy: 2, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:04.000Z, duration: 1, cpu-util: 12, carbon: 1, energy: 2, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:05.000Z, duration: 1, cpu-util: 12, carbon: 1, energy: 2, grid-carbon-intensity: 471}
]
```

The end result is that for each `observation`, we upsample the time series to yield 1 second resolution data between `timestamp` and `timestamp + duration`.

#### Gap-filling

Sometimes there might be discontinuities in the time series between one `observation` and another. For example we might have two `observations` in a set of `inputs` that have timestamps spaced 10 seconds apart, but the `duration` of the first `observation` is only 5 seconds. in this case, 5 seconds of data are unaccounted for and create a discontinuity in the time series.

To solve this problem, for all but the first `observation` in the `inputs` array, we grab the `timestamp` and `duration` from the previous `observation` and check that `timestamp[N] + duration[N] == timestamp[N+1]`. If this condition is not satisfied, we backfill the missing data with a "zero-observation" which is identical to the surrounding observations except any values whose `aggregation-method` is `sum` are set to zero. This is equivalent to assuming that when there is no data available, the app being monitored is switched off.

The end result of this gap-filling is that we have continuous 1 second resolution data that can be resampled to a new temporal resolution.

```
[
    {timestamp: 2023-12-12T00:00:00.000Z, duration: 5, cpu-util: 12, carbon: 5, energy: 10, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:08.000Z, duration: 2, cpu-util: 12, carbon: 5, energy: 10, grid-carbon-intensity: 471}
]

# There are 2 seconds of missing data between the end of timestamp[0] + duration, and timestamp[1]
# After expansion and infilling, the array becomes:

[
    {timestamp: 2023-12-12T00:00:00.000Z, duration: 1, cpu-util: 12, carbon: 1, energy: 2, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:01.000Z, duration: 1, cpu-util: 12, carbon: 1, energy: 2, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:02.000Z, duration: 1, cpu-util: 12, carbon: 1, energy: 2, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:03.000Z, duration: 1, cpu-util: 12, carbon: 1, energy: 2, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:04.000Z, duration: 1, cpu-util: 12, carbon: 1, energy: 2, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:05.000Z, duration: 1, cpu-util: 12, carbon: 1, energy: 2, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:06.000Z, duration: 1, cpu-util: 0, carbon: 0, energy: 0, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:07.000Z, duration: 1, cpu-util: 0, carbon: 0, energy: 0, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:08.000Z, duration: 1, cpu-util: 12, carbon: 2.5, energy: 5, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:09.000Z, duration: 1, cpu-util: 12, carbon: 2.5, energy: 5, grid-carbon-intensity: 471}
]
```
Note that when `error-on-padding` is `true` no gap-filling is performed and the model will error out instead.

#### Trimming and padding

To ensure parity across all the components in a graph, we need to synchronize the start and end times for all time series. To do this, we pass the `time-sync` model plugin some global config: `startTime`, `endTime` and `interval`. The `startTime` is the timestamp where *all* input arrays across the entire graph should begin, and `endTime` is the timestamp where *all* input arrays across the entire graph should end. `interval` is the time resolution we ultimately want to resample to.

To synchronize the time series start and end we check the first element of `inputs` for each node in the graph and determine whether it is earlier, later or equal to the global start time. If it is equal then no action is required. If the `input` start time is earlier than the global start time, we simply discard entries from the front of the array until the start times are aligned. If the `input` start time is after the global start time, then we pad with our "zero-observation" object - one for every second separating the global start time from the `input` start time. The same process is repeated for the end time - we either trim away `input` data or pad it out with "zero-observation" objects.

For example, for `startTime = 2023-12-12T00:00:00.000Z` and `endTime = 2023-12-12T00:00:15.000Z`:

```
[
    {timestamp: 2023-12-12T00:00:05.000Z, duration: 5, cpu-util: 12, carbon: 5, energy: 10, grid-carbon-intensity: 471},
]

# There are 5 seconds missing from the start and end. After padding, the array becomes:

[
    {timestamp: 2023-12-12T00:00:00.000Z, duration: 1, cpu-util: 0, carbon: 0, energy: 0, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:01.000Z, duration: 1, cpu-util: 0, carbon: 0, energy: 0, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:02.000Z, duration: 1, cpu-util: 0, carbon: 0, energy: 0, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:03.000Z, duration: 1, cpu-util: 0, carbon: 0, energy: 0, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:04.000Z, duration: 1, cpu-util: 0, carbon: 0, energy: 0, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:05.000Z, duration: 1, cpu-util: 12, carbon: 1, energy: 2, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:06.000Z, duration: 1, cpu-util: 12, carbon: 1, energy: 2, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:07.000Z, duration: 1, cpu-util: 12, carbon: 1, energy: 2, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:08.000Z, duration: 1, cpu-util: 12, carbon: 1, energy: 2, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:09.000Z, duration: 1, cpu-util: 12, carbon: 1, energy: 2, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:10.000Z, duration: 1, cpu-util: 0, carbon: 0, energy: 0, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:11.000Z, duration: 1, cpu-util: 0, carbon: 0, energy: 0, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:12.000Z, duration: 1, cpu-util: 0, carbon: 0, energy: 0, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:13.000Z, duration: 1, cpu-util: 0, carbon: 0, energy: 0, grid-carbon-intensity: 471},
    {timestamp: 2023-12-12T00:00:14.000Z, duration: 1, cpu-util: 0, carbon: 0, energy: 0, grid-carbon-intensity: 471},

]
```
Note that when `error-on-padding` is `true` no padding is performed and the model will error out instead.

#### Resampling rules

Now we have synchronized, continuous, high resolution time series data, we can resample. To achieve this, we use `interval`, which sets the global temporal resolution for the final, processed time series. `intervalk` is expressed in units of seconds, which means we can simply batch `observations` together in groups of size `interval`. For each value in each object we either sum, average or copy the values into one single summary object representing each time bucket of size `interval` depending on their `aggregation-method` defined in `units.yaml`. The returned array is the final, synchronized time series at the desired temporal resolution.

### Assumptions and limitations

To do time synchronization, we assume:

- There is no environmental impact for an application when there is no data available.
- Evenly distributing the total for a `duration` across higher resolution `observations` is appropriate, as opposed to having some non-uniform distribution.


## Typescript implementation

To run the model, you must first create an instance of `SciModel` and call
its `configure()` method. Then, you can call `execute()` to return `sci`.

```typescript
const timeSyncModel = new TimeSyncModel();
timeSyncModel.configure('name', {
      'start-time': '2023-12-12T00:00:00.000Z',
      'end-time': '2023-12-12T00:00:30.000Z',
      interval: 10
})
const results = timeSyncModel.execute([
    {
        timestamp: 2023-12-12T00:00:00.000Z
        duration: 10
        cpu-util: 10
        carbon: 100 
        energy: 100   
        requests: 300
    },
    {
        timestamp: 2023-12-12T00:00:10.000Z
        duration: 10
        cpu-util: 20 
        carbon: 100,
        energy: 100,   
        requests: 380
    }
])
```

## Example impl

IEF users will typically call the model as part of a pipeline defined in an `impl`
file. In this case, instantiating and configuring the model is handled by
`impact-engine` and does not have to be done explicitly by the user.
The following is an example `impl` that calls `time-sync`:

```yaml
name: time-sync-demo
description: impl with 2 levels of nesting with non-uniform timing of observations
tags:
initialize:
  models:
    - name: teads-curve
      model: TeadsCurveModel
      path: "@grnsft/if-unofficial-models"
    - name: sci-e
      model: SciEModel
      path: "@grnsft/if-models"
    - name: sci-m
      path: "@grnsft/if-models"
      model: SciMModel
    - name: sci-o
      model: SciOModel
      path: "@grnsft/if-models"
    - name: time-synchronization
      model: TimeSyncModel
      path: builtin
      config: 
        start-time: 2023-12-12T00:00:00.000Z # ISO timestamp
        end-time: 2023-12-12T00:01:00.000Z # ISO timestamp
        interval: 5 # seconds
graph:
  children:
    child: # an advanced grouping node
      pipeline:
        - teads-curve
        - sci-e
        - sci-m
        - sci-o
        - time-synchronization
      config:
        teads-curve:
          thermal-design-power: 65
        sci-m:
          total-embodied-emissions: 251000 # gCO2eq
          time-reserved: 3600 # 1 hour in s
          expected-lifespan: 126144000 # 4 years in seconds    
          resources-reserved: 1 
          total-resources: 1 
        sci-o:
          grid-carbon-intensity: 457 # gCO2/kwh
      children:
        child-1:
          inputs:
            - timestamp: 2023-12-12T00:00:00.000Z
              duration: 10
              cpu-util: 10
              carbon: 100 
              energy: 100   
              requests: 300
            - timestamp: 2023-12-12T00:00:10.000Z
              duration: 10
              cpu-util: 20    
              carbon: 200 
              energy: 200 
              requests: 380

```