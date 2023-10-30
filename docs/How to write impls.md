---
author: Joseph Cook (@jmcook1186)
abstract: Guidance for writing valid impls.
---

# IMPL writing guide

The Impact Framework receives all its configuration and input data in the form of a `yaml` file known as an `impl` (input-yaml).
To use the framework, a user only has to write an `impl` file and pass its path to the command line tool. This guide will help you to understand how to construct an `impl` and use it to measure the energy and carbon usage of your app.

## Structure of an `impl`

The basic structure of an `impl` is very simple. 

```yaml
name: 
description: 
tags: 
initialize:
  models:
    - name: 
      kind: 
      verbose: 
      path: 
graph:
  children:
    child:
      pipeline:
        - 
      config:
      inputs:
```

The `impl` starts with some metadata about the project, specifically:
- `name` 
- `description`
- `tags`. 

There is no strict specfication for how these field are used; they are for you to keep track of your impls and to provide the necessary details for other users to understand your use case.

## `initialize`

The next field is `initialize`. This is where you specify each individual model that will be instantiated in your pipeline. The models can be initialized in any order. Models cannot be invoked elsewhere in the `impl` if they have not been initialized by including them in this field. Models are initialized by providing their name and some configuration data. For example:

```yaml
initialize:
    - name: sci-m
      kind: builtin
      verbose: false
      path: ''
```


`name` has to be precisely the model name recognized by IEF. You can check all the valid model names [here](../src/util/models-universe.ts).
`kind` determines whether the model is one of IEF's built-in models, or whether the model is some external code being executed in a spawned shell. The options are `builtin` or `shell`. `verbose` determines how much information should be added to the output file. This is not yet implemented as shoudl default to `false`. `path` is used for models run in a spawned shell. It should be the path to an executable.

## `graph`

`graph` is where you define the various components of your application. `graph` is organized into `children`. Each `child` is a component whose outputs should be summed to give the overall impact of your `graph`. `children` can be nested with arbitrary depth. Each `child` can have its own model pipeline and its own config. When no config is provided, it is inherited from the `graph` level config.

In the following example, there is only one component. The model pipeline contains two models, `teads-curve` and `sci-m`. `teads-curve` requires the `tdp` to be defined in `config` and `sci-m` requires five pieces of `config` data: `total-embodied-emissions`, `time-reserved`, `expected-lifespan`, `resources-reserved` and `total-resources`.

```yaml
graph:
  children:
    child:
      pipeline:
        - teads-curve
        - sci-m
      config:
        teads-curve:
          tdp: 55
        sci-m:
          total-embodied-emissions: 1533.12
          time-reserved: 1
          expected-lifespan: 3
          resources-reserved: 1
          total-resources: 8

```

## `inputs`

Each `child` has its own set of `inputs`. These are the most granular data, each of which are associated with a specific timestamp. Every `input` must always include a `timestamp` and a `duration`.

```yaml
inputs:
  - timestamp: 2023-07-06T00:00
    duration: 3600
    cpu-util: 45
```

That's it! You now have a simple `impl` file that will use the model config and input data to run the `teads-curve` and `sci-m` models! The output data will be appended to the `impl` under a new `outputs` field and saved as an `ompl` file.

## More complex `impls`

### Complex pipelines

The basic `impl` in the previous section is valid, but it is minimal and doesn't return very interesting output data. We expect most users will want to calculate an SCI score, which requires both `operational-carbon` and `embodied-carbon` as inputs, which requires `sci` to be preceded by `sci-m` and `sci-o` in the model pipeline. In most cases, `sci-o` will have to be preceded by `sci-e` to ensure `energy` is available to be piped to `sci-o`. And, most likely, the inputs to `sci-e` will be coming from a model such as `teads-curve`. The `sci` model also requires `functional-unit` information so it can convert the estimated `carbon` into a useful unit.

An example of a complex pipeline that executes all these model sin sequence is:

```yaml
name: full-sci
description: example executing a full pipeline from teads --> sci
tags:
initialize:
  models:
    - name: teads-curve
      kind: builtin
    - name: sci-m
      kind: builtin
    - name: sci-o
      kind: builtin
    - name: sci-e
      kind: builtin
    - name: sci
      kind: builtin
graph:
  children:
    child:
      pipeline:
        - teads-curve
        - sci-m
        - sci-e
        - sci-o
        - sci
      config:
        teads-curve:
          tdp: 55
        sci-m:
          te: 1533.12
          tir: 1
          el: 3
          rr: 1
          tor: 8
        sci-o:
          grid-ci: 1500     
        sci:
          functional_unit_duration: 1 
          functional_unit_time: 'minutes'
          functional_unit: requests # factor to convert per time to per f.unit
      inputs:
        - timestamp: 2023-07-06T00:00
          duration: 1
          cpu-util: 55
          requests: 100

```

### Complex applications

The `impl` examples provided so far have only had a single component. However, IEF can handle any number of `children` that can be nested.
The following snippet shows how you can nest multiple subcomponents. 

```yaml
name: nesting-demo
description:
tags:
  kind: web
  complexity: moderate
  category: on-premise
initialize:
  models:
    - name: teads-curve
      kind: builtin
    - name: sci-e
      kind: builtin
      verbose: false
      path: ''
    - name: sci-m
      kind: builtin
      verbose: false
      path: ''
    - name: sci-o
      kind: builtin
      verbose: false
      path: ''
    - name: sci
      kind: builtin
      verbose: false
      path: ''
graph:
  children:
    server: # an advanced grouping node
      pipeline:
        - teads-curve
        - sci-e
        - sci-m
        - sci-o
        - sci
      config:
        teads-curve:
          tdp: 65
        sci-m:
          te: 251000 # gCO2eq
          tir: 3600 # 1 hour in s
          el: 126144000 # 4 years in seconds    
          rr: 1 
          tor: 1 
        sci-o:
          grid-ci: 457 # gCO2/kwh
        sci:
          functional_unit_duration: 1 
          functional_duration_time: ''
          functional_unit: requests # factor to convert per time to per f.unit
      children:
        nested-1:
          inputs:
            - timestamp: 2023-07-06T00:00
              duration: 10
              cpu-util: 50
              e-net: 0.000811 #kwh     
              requests: 380
        nested-2:
          inputs: 
            - timestamp: 2023-07-06T00:00
              duration: 10
              cpu-util: 33
              e-net: 0.000811 #kwh     
              requests: 380 

```

You can combine complex model pipelines and complex application architectures to calculate the energy and carbon outputs of complicated systems!

## Choosing which models to run

The models are designed to be composable, but they each have specific input requirements that must be met in order for the models to run correctly. For example, teh `teads-curve` model requires `tdp` to be available in the `impl`. If it is not there, the model cannot use it to calculate `e-cpu`. You can refer to the [individual model documentation](../docs/implementations/Readme.md) to see the parameters and return values for each model. 

it is also possible to leapfrog some models if you have access to high-level data. For example, perhaps you already know the energy being used by your CPU. In this case, there is no need to run `teads-curve`, you can simply provide `e-cpu` as an `input` and omit `teads-curve` from the model pipeline.

We have deliberately made the models modular and composable so that you can be creative in developing new plugins to replace those provided as part of IEF.

## Running an `impl`

You run an impl by providing its path to our command line tool, along with a path to save the results file to. You can run an `impl` named `my-impl.yml` as follows:

```sh
npx ts-node scripts/impact.ts --impl ./examples/impls/my-impl.yml --ompl ./examples/ompls/my-ompl.yml
```

