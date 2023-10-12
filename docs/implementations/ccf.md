# Cloud Carbon Footprint

"Cloud Carbon Footprint is an open source tool that provides visibility and tooling to measure, monitor and reduce your cloud carbon emissions. We use best practice methodologies to convert cloud utilization into estimated energy usage and carbon emissions, producing metrics and carbon savings estimates that can be shared with employees, investors, and other stakeholders." - [CCF](https://www.cloudcarbonfootprint.org/)

## IEF Implementation

IEF reimplements the Cloud Carbon Footprint methodology fro scratch conforming to the IEF specification. This means the CCF models can be run inside IEF without any external API calls and can be invoked as part of a model pipeline defined in an `impl`.

Cloud Carbon Footprint includes calculations for three cloud providers: AWS, Azure and GCP. 

The general methodology is as follows:

`Total CO2e = operational emissions + embodied Emissions`

Where:

`Operational emissions = (Cloud provider service usage) x (Cloud energy conversion factors [kWh]) x (Cloud provider Power Usage Effectiveness (PUE)) x (grid emissions factors [metric tons CO2e])`

And:

`Embodied Emissions = estimated metric tons CO2e emissions from the manufacturing of datacenter servers, for compute usage`

You can read a detailed explanation ofn the calculations in the [CCF docs](https://www.cloudcarbonfootprint.org/docs/methodology/) and see the code for our implementation in [this repository](../../src/lib/ccf/).

## Usage

In IEF, the model is called from an `impl`. An `impl` is a `.yaml` file that contains configuration metadata and usage observations. This is interpreted by the command line tool, `rimpl`. There, the model's `configure` method is called first. The model config should define a `provider` and `instance-type`. Each observation is expected to contain `duration`,`cpu-util` and `timestamp` fields.

You can see example Typescript invocations for each provider below:

### AWS

```typescript
import {CloudCarbonFootprint} from 'ief';

const ccf = new CloudCarbonFootprint();
ccf.configure({
  provider: 'aws',
  instance_type: 'm5n.large'
})
const results = ccf.calculate([
  {
    duration: 3600, // duration institute
    cpu-util: 10, // CPU usage as a percentage
    timestamp: '2021-01-01T00:00:00Z', // ISO8601 / RFC3339 timestamp
  }
])
```

### Azure

```typescript
import {CloudCarbonFootprint} from 'ief';

const ccf = new CloudCarbonFootprint();
ccf.configure({
  provider: 'azure',
  instance_type: 'D4 v4'
})
const results = ccf.calculate([
  {
    duration: 3600, // duration institute
    cpu-util: 10, // CPU usage as a percentage
    timestamp: '2021-01-01T00:00:00Z', // ISO8601 / RFC3339 timestamp
  }
])
```

### GCP

```typescript
import {CloudCarbonFootprint} from 'ief';

const ccf = new CloudCarbonFootprint();
ccf.configure({
  provider: 'gcp',
  instance_type: 'n2-standard-2'
})
const results = ccf.calculate([
  {
    duration: 3600, // duration institute
    cpu-util: 10, // CPU usage as a percentage
    timestamp: '2021-01-01T00:00:00Z', // ISO8601 / RFC3339 timestamp
  }
]) 
```

## Example Impl

The following is an example of how CCF can be invoked using an `impl`.

```yaml
name: ccf-demo
description: example impl invoking CCF model
initialize:
  models:
    - name: ccf
      kind: builtin
graph:
  children:
    child:
      pipeline:
        - ccf
      config:
        ccf:
          provider: aws
          instance_type: m5n.large
      observations:
        - timestamp: 2023-07-06T00:00 # [KEYWORD] [NO-SUBFIELDS] time when measurement occurred
          duration: 1
          cpu-util: 10
```

This impl is run using `rimpl` using the following command, run from the project root:

```sh
npx ts-node scripts/rimpl.ts --impl ./examples/impls/ccf-test.yml --ompl ./examples/ompls/ccf-test.yml
```

This yields a result that looks like the following (saved to `/ompls/ccf-test.yml`):

```yaml
name: ccf-demo
description: example impl invoking CCF model
initialize:
  models:
    - name: ccf
      kind: builtin
graph:
  children:
    front-end:
      pipeline:
        - ccf
      config:
        ccf:
          provider: aws
          instance_type: m5n.large
      observations:
        - timestamp: 2023-07-06T00:00
          duration: 1
          cpu: 10
      impacts:
        - timestamp: 2023-07-06T00:00
          duration: 1
          cpu-util: 10
          provider: aws
          instance_type: m5n.large
          energy: 0.000018845835066981333
          embodied_emissions: 0.02553890791476408
```