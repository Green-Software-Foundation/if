# SCI (software carbon intensity)

[SCI](https://sci-guide.greensoftware.foundation/) is the final value the framework ultimately aims to return for some component or application. It represents the amount of carbon emitted per [functional unit](https://sci-guide.greensoftware.foundation/R/).

## Calculation

SCI is calculated as:

```
sci = operational-carbon + embodied-carbon / functional unit
```

where `operational-carbon` is the product of `energy` and `grid-intensity`. The SCI-guide represents this as

```
SCI = (E * I) + M per R
```

where `E` = energy used in kWh, `I` is grid intensity in gCO2e/kWh, `M` is embodied carbon, and `R` is the functional unit.

SCI is the sum of the `operational-carbon` (calculated using the `sci-o` model) and the `embodied-carbon` (calculated using the `sci-m` model). It is then converted to some functional unit, for example for an API the functional unit might be per request, or for a website it might be per 1000 visits. 

## IEF Implementation

`sci` takes `operational-carbon` and `embodied-carbon` as inputs along with three parameters related to the functional unit: 

- `functional-unit`: a string describing the functional unit to normalize the SCI to. This must match a field provided in the `inputs` with an associated value. For example, if `functional-unit` is `"requests"` then there should be a `requests` field in `obserations` with an associated value for the number of requests per `functional-unit-duration`.
- `functional-unit-time`: a time unit for `functional-unit-duration` as a string. E.g. `s`, `seconds`, `days`, `months`, `y`.
- `functional-unit-duration`: The length of time, in units of `functional-unit-time` that the `sci` value should be normalized to. We expect this to nearly always be `1`, but for example if you want your `sci` value expressed as gC/user/2yr you could set `functional-unit-duration` to `2`, `functional-unit-time` to `years`, and `functional-unit` to `y`.

In a model pipeline, time is always denominated in `seconds`. It is only in `sci` that other units of time are considered. Therefore, if `functional-unit-time` is `month`, then the sum of `operational-carbon` and `embodied-carbon` is multiplied by the number of seconds in one month.

Example:

```
operational-carbon: 0.02  // operational-carbon per s
embodied-carbon: 5   // embodied-carbon per s
functional-unit: requests  // indicate the functional unit is requests
functional-unit-time: minute  // time unit is minutes
functional-unit-duration: 1  // time span is 1 functional-unit-time (1 minute)
requests: 100   // requests per minute

sci-per-s = operational-carbon + embodied-carbon / duration  // (= 5.02)
sci-per-minute = sci-per-s * 60  // (= 301.2)
sci-per-f-unit = sci-per-duration / 100  // (= 3.012 gC/request)
```

To run the model, you must first create an instance of `SciModel` and call its `configure()` method. Then, you can call `calculate()` to return `sci`.

```typescript
import { SciModel } from '@gsf/ief';

const sciModel = new SciModel();
sciModel.configure('name', {
      functional-unit-time: 'day',
      functional-unit: 'requests',
      functional-unit-duration: 1,)
const results = sciModel.calculate([
  {
    operational-carbon: 0.02
    embodied-carbon: 5,
    duration: 1
    requests: 100,
  }
])
```

## Example impl

IEF users will typically call the model as part of a pipeline defined in an `impl` file. In this case, instantiating and configuring the model is handled by `impact` and does not have to be done explicitly by the user. The following is an example `impl` that calls `sci`:

```yaml
name: sci-demo
description: example invoking sci model
tags:
initialize:
  models:
    - name: sci # sums SCI components and converts to f.unit
      kind: builtin
      path: ''
graph:
  children:
    child:
      pipeline:
        - sci
      config:
        sci:
          functional-unit-duration: 1 
          functional-unit-time: 'minutes'
          functional-unit: requests # factor to convert per time to per f.unit
      inputs:
        - timestamp: 2023-07-06T00:00
          operational-carbon: 0.02
          embodied-carbon: 5
          duration: 1
          requests: 100
```