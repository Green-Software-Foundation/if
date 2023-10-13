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

## Example impl

IEF users will typically call the shell model as part of a pipeline defined in an `impl` file. In this case, instantiating and configuring the model is handled by `rimpl` and does not have to be done explicitly by the user. The following is an example `impl` that calls an external model via `shell-imp`:

```yaml
name: shell-demo
description:
tags:
initialize:
  models:
    - name: sampler
      kind: shell
      path: python3 /usr/local/bin/sampler
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

```

In this example, the model invoked by executing `python3 /usr/local/bin/sampler` in a shell.