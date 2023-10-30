# SCI-E (total energy)

`sci-e` is a model that simply sums up the contributions to a component's energy use. The model retunrs `energy` which is used as the input to the `sci-o` model that calculates operational emissions for the component.

## Calculation

`energy` is calculated as the sum of the energy due to CPU usage, energy due to network trafic, energy due to memory and energy due to GPU usage.

```
energy = energy-cpu + energy-network + energy-memory + e-gpu
```

In any model pipeline that includes `sci-o`, `sci-o` must be preceded by `sci-e`. This is because `sci-o` does not recognize the individual contributions, `energy-cpu`, `energy-network`, etc, but expects to find `energy`. Only `sci-e` takes individual contributions and returns `energy`.

## Implementation

To run the model, you must first create an instance of `SciEModel` and call its `configure()` method. Then, you can call `calculate()` to return `energy`.

```typescript
import { SciEModel } from '@gsf/ief';

const sciEModel = new SciEModel();
sciEModel.configure()
const results = sciEModel.calculate([
  {
    energy-cpu: 0.001,
    energy-memory: 0.0005,
    energy-network: 0.0005,
  }
])
```

## Example impl

IEF users will typically call the model as part of a pipeline defined in an `impl` file. In this case, instantiating and configuring the model is handled by `impact` and does not have to be done explicitly by the user. The following is an example `impl` that calls `sci-e`:

```yaml
name: sci-e-demo
description:
tags:
initialize:
  models:
    - name: sci-e
      kind: builtin
graph:
  children:
    child:
      pipeline:
        - sci-e
      config:
        sci-e:
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          energy-cpu: 0.001

```