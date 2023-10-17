# Shell-imp

The `shell-imp` is a wrapper enabling models external to IEF to be executed as part of an IEF pipeline. For example, you might have a standalone model written in Python. `shell-imp` spawns a subprocess to execute that Python model in a dedicated shell and pipes the results back into IEF's Typescript process.

## Implementation

To run the model, you must first create an instance of `ShellModel` and call its `configure()` method. The `configure` method takes `executable` as an argument - this is a path to an executable file. Then, you can call `calculate()` to run the external model.

```typescript
const impactModel = new ShellModel();
await impactModel.configure('test', {
    executable: '/usr/local/bin/sampler',
});
const result = await impactModel.calculate([
    {duration: 3600, cpu: 0.5, datetime: '2021-01-01T00:00:00Z'}
    ])
```

## Considerations

The `shell-imp` is designed to run arbitrary external models. This means IEF does not necessarily know what calculations are being executed in the external model. there is no struct requirement on the return type, as this depends upon the calculations and the position of the external model ina  model pipeline. For example, one external model might carry out the entire end-to-end SCI calculation, taking in usage observations and returning `sci`. In this case, the model is expected to return `sci` and it would be the only model invoked in the `impl`. 

However, it is also entirely possible to have external models that only deliver some small part of the overall SCI calculation, and rely on IEF builtin models to do the rest. For example, perhaps there is a proprietary model that a user wishes to use as a drop-in replacement for the Teads TDP model. In this case, the model would take usage observations as inputs and would need to return some or all of `e_cpu`, `e-net`, `e-mem` and `e-gpu`. These would then be passed to the `sci-e` model to return `energy`, then `sci-o` to return `embodied-carbon`.

Since the design space for external models is so large, it is up to external model developers to ensure compatibility wioth IEF built-ins.

## Example impl

IEF users will typically call the shell model as part of a pipeline defined in an `impl` file. In this case, instantiating and configuring the model is handled by `rimpl` and does not have to be done explicitly by the user. The following is an example `impl` that calls an external model via `shell-imp`. It asumes the model takes `e-cpu` and `e-mem` as inputs and returns `energy`:

```yaml
name: shell-demo
description:
tags:
initialize:
  models:
    - name: sampler
      kind: shell
      path: python3 /usr/local/bin/energy-calculator
graph:
  children:
    child:
      pipeline:
        - sampler
      config:
        sampler:
          executable: python3 /usr/local/bin/sampler
      observations:
        - timestamp: 2023-07-06T00:00
          duration: 1 # Secs
          e-cpu: 0.002
          e-mem: 0.000005

```

In this hypothetical example, the model is written in Python and invoked by executing `python3 /usr/local/bin/energy-calculator` in a shell.
The model should return an `ompl` looking as follows:

```yaml
name: shell-demo
description:
tags:
initialize:
  models:
    - name: sampler
      kind: shell
      path: python3 /usr/local/bin/energy-calculator
graph:
  children:
    child:
      pipeline:
        - sampler
      config:
        sampler:
          executable: python3 /usr/local/bin/sampler
      observations:
        - timestamp: 2023-07-06T00:00
          duration: 1 # Secs
          e-cpu: 0.002
          e-mem: 0.000005
      impacts:
        - timestamp: 2023-07-06T00:00
          duration: 1 # Secs
          e-cpu: 0.002
          e-mem: 0.000005
          energy: 0.02 # added by model
```