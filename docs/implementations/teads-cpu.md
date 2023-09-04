# Teads' CPU Estimation Model

Teads Engineering team has built a model that is capable of estimating CPU usages across varying type of CPUs using a curve commonly known as Teads Curve.

## Implementation

### Linear Interpolation

This model implements linear interpolation by default for estimating energy consumption using the TDP of a chip.

The power curve provided for `IDLE`, `10%`, `50%`, `100%` in the Teads Curve are used by default.

The algorithm in linear interpolation will take the lowest possible base value + linear interpolated value. ie. 75% usage will be calculated by taking (50% as base + (100%-50%) _ (75%-50%)) _ `TDP`.

#### Example

```typescript
import {TeadsCurveModel} from 'ief';

const teads = new TeadsCurveModel();
teads.configure({
  instance_type: 'c6i.large',
});
const results = teads.calculate([
  {
    duration: 3600, // duration institute
    cpu: 0.1, // CPU usage as a value between 0 and 1 in floating point number
    datetime: '2021-01-01T00:00:00Z', // ISO8601 / RFC3339 timestamp
  },
]);
```

### Spline Curve Approximation

This method implements the spline curve approximation using `typescript-cubic-spline`. It is not possible to customize the spline behaviour as of now.

Resulting values are an approximation / estimation based on the testing done by Teads' Engineering Team. Further information can be found in the following links.

1. [TEADS Engineering: Building An AWS EC2 Carbon Emissions Dataset](https://medium.com/teads-engineering/building-an-aws-ec2-carbon-emissions-dataset-3f0fd76c98ac)
2. [TEADS Engineering: Estimating AWS EC2 Instances Power Consumption](https://medium.com/teads-engineering/estimating-aws-ec2-instances-power-consumption-c9745e347959)

#### Example

```typescript
import {TeadsCurveModel, TeadsInterpolation} from '@gsf/ief';

const teads = new TeadsCurveModel();
teads.configure({
  instance_type: 'c6i.large',
  interpolation: Interpolation.SPLINE,
});
const results = teads.calculate([
  {
    duration: 3600, // duration institute
    cpu: 0.1, // CPU usage as a value between 0 and 1 in floating point number
    datetime: '2021-01-01T00:00:00Z', // ISO8601 / RFC3339 timestamp
  },
]);
```
