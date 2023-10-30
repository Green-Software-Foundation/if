# Boavizta

[Boavizta](https://boavizta.org/) is an environmental impact calculator that exposes an API we use in IEF to retrieve energy and embodied carbon estimates.

## Implementation

Boavizta exposes a [REST API](https://doc.api.boavizta.org/). If the `boavizta` model is included in an IEF pipeline, IEF sends API requests to Boavizta. The request payload is generated from input data provided to IEF in an `impl` file.

## Usage

To run the `boavista-cpu` model an instance of `BoaviztaCpuImpactModel` must be created and its `configure()` method called. Then, the model's `calculate()` method can be called, passing `duration`,`cpu-util`,`timestamp` arguments.

This is how you could run the model in Typescript:

```typescript
import {BoaviztaCpuImpactModel, KeyValuePair} from '../src';

async function runBoavizta() {
  const params: KeyValuePair = {};
  params.allocation = 'TOTAL';
  params.verbose = true;
  params.name = 'Intel Xeon Platinum 8160 Processor';
  params.core_units = 24;

  const newModel = await new BoaviztaCpuImpactModel().configure('test', params);
  const usage = await newModel.calculate([
    {
      timestamp: '2021-01-01T00:00:00Z',
      duration: '15s',
      cpu-util: 34,
    },
    {
      timestamp: '2021-01-01T00:00:15Z',
      duration: '15s',
      cpu-util: 12,
    },
    {
      timestamp: '2021-01-01T00:00:30Z',
      duration: '15s',
      cpu-util: 1,
    },
    {
      timestamp: '2021-01-01T00:00:45Z',
      duration: '15s',
      cpu-util: 78,
    },
  ]);

  console.log(usage);
}

runBoavizta();
```

## Example impl

In IEF models are expected to be invoked from an `impl` file. This is a yaml containing the model configuration and inputs. The following `impl` initializes and runs the `boavizta-cpu` model:

```yaml
name: boavizta-demo
description: calls boavizta api
tags:
initialize:
  models:
    - name: boavizta-cpu
      kind: builtin
      config:
        allocation: LINEAR
        verbose: true
graph:
  children:
    front-end:
      pipeline: 
        - boavizta-cpu
      config:
        boavizta-cpu:
          core-units: 24
          processor: Intel® Core™ i7-1185G7
      inputs:
        - timestamp: 2023-07-06T00:00 # [KEYWORD] [NO-SUBFIELDS] time when measurement occurred
          duration: 3600 # Secs
          cpu-util: 18.392
        - timestamp: 2023-08-06T00:00 # [KEYWORD] [NO-SUBFIELDS] time when measurement occurred
          duration: 3600 # Secs
          cpu-util: 16
```

You can run this by passing it to `rimpl`. Run rimpl using the following command run from the project root:

```sh
npx ts-node scripts/rimpl.ts --impl ./examples/impls/boavizta.yml --ompl ./examples/ompls/boavizta.yml
```