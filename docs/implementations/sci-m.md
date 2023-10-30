# SCI-M: embodied carbon

Software systems cause emissions through the hardware that they operate on, both through the energy that the physical hardware consumes and the emissions associated with manufacturing the hardware. Embodied carbon refers to the carbon emitted during the manufacture and eventual disposal of a component. It is added to the operational carbon (carbon emitted when a component is used) to give an overall SCI score.

Read more on [embodied carbon](https://github.com/Green-Software-Foundation/sci/blob/main/Software_Carbon_Intensity/Software_Carbon_Intensity_Specification.md#embodied-emissions)

## Calculation

To calculate the embodied carbon, `m` for a software application, use the equation:

```
m = te * ts * rs
```
Where:

- `te` = Total embodied emissions; the sum of Life Cycle Assessment (LCA) emissions for the component.

- `ts` = Time-share; the share of the total life span of the hardware reserved for use by an application. 
  - `ts` is calculated as `tir/el`, where:
    - `tir` = Time Reserved; the length of time the hardware is reserved for use by the software.
    - `el` = Expected lifespan: the length of time, in seconds, between a component's manufacture and its disposal

- `rs` = Resource-share; the share of the total available resources of the hardware reserved for use by an application. 
  - `rs` is calculated as `rr/tor`, where:
    - `rr` = Resources reserved; the number of resources reserved for use by the software.
    - `tor` = Total Resources; the total number of resources available.


## Implementation

IEF implements the plugin based on the logic described above. To run the model, you must first create an instance of `SciMModel` and call its `configure()` method. Then, you can call `calculate()` to return `m`.

It expects all of the following parameters to be provided in order to calculate `m`:

```
te
tir
el
rr
tor
```

## Usage

The following snippet demonstrates how to call the `sci-m` model from Typescript.

```typescript
import { SciMModel } from '@gsf/ief';

const sciMModel = new SciMModel();
sciMModel.configure()
const results = sciMModel.calculate([
  {
    total-embodied-emissions: 200, // in gCO2e for total resource units
    time-reserved 60 * 60 * 24 * 30, // time reserved in seconds, can point to another field "duration"
    expected-lifespan: 60 * 60 * 24 * 365 * 4, // lifespan in seconds (4 years)
    resources-reserved: 1, // resource units reserved / used
    total-resources: 1, // total resource units available
  }
])
```

## Example impl

IEF users will typically call the model as part of a pipeline defined in an `impl` file. In this case, instantiating and configuring the model is handled by `rimpl` and does not have to be done explicitly by the user. The following is an example `impl` that calls `sci-m`:

```yaml
name: sci-m
description: simple demo invoking sci-m
tags:
initialize:
  models:
    - name: sci-m # a model that calculates m from te, tir, el, rr and rtor
      kind: builtin
      verbose: false
      path: ''
graph:
  children:
    child:
      pipeline: 
        - sci-m # duration & config -> embodied
      config:
        sci-m:
          total-embodied-emissions: 1533.120 # gCO2eq
          time-reserved: 1 # s per hour
          expected-lifespan: 3 # 3 years in seconds        
          resources-reserved: 1
          total-resources: 8
      inputs: 
        - timestamp: 2023-07-06T00:00
          duration: 3600
```

You can run this example `impl` by executing the following command from the project root:

```sh
npx ts-node scripts/rimpl.ts --impl ./examples/impls/sci-m.yml --ompl ./examples/ompls/sci-m-test.yml
```

The results will be saved to a new `yaml` file in `/ompls`.