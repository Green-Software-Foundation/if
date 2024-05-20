# SCI (software carbon intensity)

[SCI](https://sci-guide.greensoftware.foundation/) represents the amount of carbon emitted per [functional unit](https://sci-guide.greensoftware.foundation/R/).

## Parameters

### Plugin global config

- `functional-unit`: the functional unit in which to express the carbon impact
- `functional-unit-time`: the time to be used for functional unit conversions, as a string composed of a value and a unit separated with a space, hyphen or underscore, e.g. `2 mins`, `5-days`, `3_years`

### Plugin node config

- `functional-unit`: the functional unit in which to express the carbon impact. If the property is also declared in the global config, it will be overridden.

### Inputs

either:

- `carbon`: total carbon, i.e. sum of embodied and operational, in gCO2eq

or both of

- `carbon-operational`: carbon emitted during an application's operation in gCO2eq
- `carbon-embodied`: carbon emitted in a component's manufacture
  and disposal in gCO2eq

and:

- `timestamp`: a timestamp for the input
- `duration`: the amount of time, in seconds, that the input covers.

## Returns

- `carbon`: the total carbon, calculated as the sum of `carbon-operational`
  and `carbon-embodied`, in gCO2eq
- `sci`: carbon expressed in terms of the given functional unit

## Calculation

SCI is calculated as:

```pseudocode
sci = carbon-operational + carbon-embodied / functional unit
```

where `carbon-operational` is the product of `energy` and `grid-intensity`.
The SCI-guide represents this as

```pseudocode
SCI = (E * I) + M per R
```

where
`E` = energy used in kWh,
`I` is grid intensity in gCO2e/kWh,
`M` is embodied carbon, and
`R` is the functional unit.

SCI is the sum of the `carbon-operational` (calculated using the `sci-o` plugin)
and the `carbon-embodied` (calculated using the `sci-m` plugin).
It is then converted to some functional unit, for example for an API the
functional unit might be per request, or for a website
it might be per 1000 visits.

## IF Implementation

`sci` takes `carbon-operational` and `carbon-embodied` as inputs along
with two parameters related to the functional unit:

- `functional-unit`: a string describing the functional unit to normalize
  the SCI to. This must match a field provided in the `inputs` with
  an associated value.
  For example, if `functional-unit` is `requests` then there should be
  a `requests` field in `inputs` with an associated value for
  the number of requests per `functional-unit`.
- `functional-unit-time`: a time value and a unit as a single string.
  E.g. `2 s`, `10 seconds`, `3 days`, `2 months`, `0.5 y`.

In a plugin pipeline, time is always denominated in `seconds`. It is only in
`sci` that other units of time are considered. Therefore, if `functional-unit-time`
is `1 month`, then the sum of `carbon-operational` and `carbon-embodied` is
multiplied by the number of seconds in one month.

Example:

```yaml
carbon-operational: 0.02  // carbon-operational per s
carbon-embodied: 5   // carbon-embodied per s
functional-unit: requests  // indicate the functional unit is requests
functional-unit-time: 1 minute  // time unit is minutes
requests: 100   // requests per minute
```

```pseduocode
sci-per-s = carbon-operational + carbon-embodied / duration  // (= 5.02)
sci-per-minute = sci-per-s * 60  // (= 301.2)
sci-per-functional-unit-time = sci-per-minute * number of minutes
sci-per-f-unit = sci-per-functional-unit-time / 100  // (= 3.012 gC/request)
```

To run the plugin, you must first create an instance of `Sci`. Then, you can call `execute()` to return `sci`.

```typescript
import {Sci} from 'builtins';

const sci = Sci({'functional-unit': 'requests'});
const results = await sci.execute(
  [
    {
      'carbon-operational': 0.02,
      'carbon-embodied': 5,
      duration: 1,
      requests: 100,
    },
  ],
  {
    'functional-unit-time': '1 day',
  }
);
```

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in a `manifest`
file. In this case, instantiating the plugin is handled by
`ie` and does not have to be done explicitly by the user.
The following is an example `manifest` that calls `sci`:

```yaml
name: sci-demo
description: example invoking sci plugin
tags:
initialize:
  outputs:
    - yaml
  plugins:
    sci:
      method: Sci
      path: 'builtins'
      global-config:
        functional-unit-time: '5 minutes'
tree:
  children:
    child:
      pipeline:
        - sci
      config:
        sci:
          functional-unit: requests # factor to convert per time to per f.unit
      inputs:
        - timestamp: 2023-07-06T00:00
          carbon-operational: 0.02
          carbon-embodied: 5
          duration: 1
          requests: 100
```

You can run this example `manifest` by saving it as `./manifests/plugins/sci.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
ie --manifest ./examples/manifests/test/sci.yml --output ./examples/outputs/sci.yml
```

The results will be saved to a new `yaml` file in `./examples/outputs`.
