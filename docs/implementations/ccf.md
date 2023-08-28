# Cloud Carbon Footprint

Cloud Carbon Footprint is an open source tool that provides visibility and tooling to measure, monitor and reduce your cloud carbon emissions. We use best practice methodologies to convert cloud utilization into estimated energy usage and carbon emissions, producing metrics and carbon savings estimates that can be shared with employees, investors, and other stakeholders.

## Implementation

IEF implements this plugin to the IEF Specification based on the computational methodology used by the Cloud Carbon Footprint.

Cloud Carbon Footprint includes calculations for three cloud providers namely AWS, Azure and GCP. 

By default, Linear interpolation is used to estimate the energy. Interpolation is performed using the CPU Design Cycle, for example in Intel Chips, **CoffeeLake** and for example in AMD Chips, **EPYC 2nd Gen**.

Additionally, **TEADS model curve for AWS** available in the CCF dataset can be used for spline curve interpolation for instances in AWS infrastructure.

Resulting values are generally approximation and should be revalidated across different models as there can be significant difference between values.

## Usage

Configure method has to be called on the instantiated object before any other calls are done. 

Calculate method expects an array of observations. Each observation should feature `duration`,`cpu`,`datetime` in the formats specified below.


### AWS

```typescript
import {CloudCarbonFootprint} from 'ief';

const ccf = new CloudCarbonFootprint();
ccf.configure({
  provider: 'aws',
  instance_type: 'c6i.large'
})
const results = ccf.calculate([
  {
    duration: 3600, // duration institute
    cpu: 0.1, // CPU usage as a value between 0 and 1 in floating point number
    datetime: '2021-01-01T00:00:00Z', // ISO8601 / RFC3339 timestamp
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
    cpu: 0.1, // CPU usage as a value between 0 and 1 in floating point number
    datetime: '2021-01-01T00:00:00Z', // ISO8601 / RFC3339 timestamp
  }
])
```

### GCP

```typescript
import {CloudCarbonFootprint} from 'ief';

const ccf = new CloudCarbonFootprint();
ccf.configure({
  provider: 'aws',
  instance_type: 'n2-standard-2'
})
const results = ccf.calculate([
  {
    duration: 3600, // duration institute
    cpu: 0.1, // CPU usage as a value between 0 and 1 in floating point number
    datetime: '2021-01-01T00:00:00Z', // ISO8601 / RFC3339 timestamp
  }
]) 
```


