---
author: Asim Hussain (@jawache)
abstract: How models are chained together into a pipeline in order to compute the impacts of
---
# Model Pipeline

## Introduction

As [Peter H. Salus](https://en.wikipedia.org/wiki/Peter_H._Salus "Peter H. Salus") said in his book [A Quarter-Century of Unix](https://en.wikipedia.org/wiki/Unix_philosophy#cite_note-taoup-ch1s6-1) the Unix philosophy is:
- Write programs that do one thing and do it well.
- Write programs to work together.
- Write programs to handle text streams, because that is a universal interface.

Our approach to models in the [Impact Engine Framework](Impact%20Engine%20Framework.md) is the same. 
- Each model will do one thing and do it well. 
- Models work with each other. 
- The [Impl (Impact YAML)](Impl%20(Impact%20YAML).md) text format is the communication medium between models.

Calculating a component's impacts often requires using multiple models in sequence. Each model takes as input the outputs of the previous model in the chain, all working together to calculate impacts from observations.

```mermaid 
flowchart LR
Observations --> Model1 --> Model2 --> Model3 --> Impacts
```

At the start of the chain, we input source observations. Each model in the chain takes as input the observations and modifies them somehow before passing them along to the next model in the chain.

The nature of the modification is flexible and defined by the model. Some model plugins will calculate an impact metric (for example, energy from utilization) and add that to the observation before passing that to the next model. Some models will enrich the observation with meta-data required for other models, for example, adding grid carbon intensity values.

## Initialization

All the model plugins used in any component in the graph are configured at the top of the [Impl (Impact YAML)](Impl%20(Impact%20YAML).md) in the initialize section. There are multiple places to add configuration for model plugins; any configuration added here is global and applied to every use of the model throughout the graph.

```yaml
.
.
initialize:
  plugins:
    - name: <model-name-1>
      path: <path-to-ts-module-to-load>
      config:
	       <key>: <value>
    - name: <model-name-2>
      path: <path-to-ts-module-to-load>
      config:
	       <key>: <value>	       
.
.
graph: ~
```

## Usage

In component nodes, we then configure the models we want to use in a pipeline like so:

```yaml
backend:
  pipeline: "model-1 | model-2 | model-3"
  config: 
    model-1:
      <key>: <value>
    model-2:
      <key>: <value>        
    model-3:
      <key>: <value>                
  observations: 
    - timestamp: 2023-07-06T00:00
      duration: 5
      cpu: 33
    - timestamp: 2023-07-06T00:05
      duration: 5
      cpu: 23
    - timestamp: 2023-07-06T00:10
      duration: 5
      cpu: 11
```


- `pipeline` defines the models we apply and the order in which we use them.
- `config` in this part of the graph is config for each model in the pipeline (if any is required). Since we have multiple models, we need to define each config independently.
- `observations` are the source observations, the values we are pumping into the start of this pipeline.

The above is the short form; the long form would be to use a YAML array, like so:

```yaml
backend:
  pipeline: 
    - model-1
    - model-2
    - model-3
  config: 
    model-1:
      <key>: <value>
    model-2:
      <key>: <value>        
    model-3:
      <key>: <value>
```
## Example

Let's look at a simple pseudo example, to begin with a pipeline like so:

`instance-metadata | tdp | teads-curve`

Using the above, we can combine multiple smaller models together to calculate the energy consumed by this observation:

```yaml
observations: 
  - timestamp: 2023-07-06T00:00
    vendor: aws
    instance_type: m5d.large
    duration: 5
    cpu: 33
```

### `instance-metadata`

This model plugin takes as input an *instance type* and outputs the name of the physical processor of the underlying architecture as well as other valuable metadata, like so:

```yaml
observations: 
  - timestamp: 2023-07-06T00:00
    vendor: aws
    instance_type: m5d.large
    duration: 5
    cpu: 33
```

to 

```yaml
observations: 
  - timestamp: 2023-07-06T00:00
    vendor: aws
    instance_type: m5d.large
    duration: 5
    cpu: 33
    physical_processor: Intel Xeon Platinum 8175 # <-- output
    used_cores: 1 # <-- output
    total_cores: 26	# <-- output  	 
```


### `tdp`

Takes as input details about a physical processor, does a lookup against a [database](https://www.intel.com/content/www/us/en/products/sku/120506/intel-xeon-platinum-8170-processor-35-75m-cache-2-10-ghz/specifications.html) to obtain the TDP value (a measure of max power consumption), like so:

```yaml
observations: 
  - timestamp: 2023-07-06T00:00
    vendor: aws
    instance_type: m5d.large
    duration: 5
    cpu: 33
    physical_processor: Intel Xeon Platinum 8175 # <-- input
    used_cores: 1
    total_cores: 26
```

to

```yaml
observations: 
  - timestamp: 2023-07-06T00:00
    vendor: aws
    instance_type: m5d.large
    duration: 5
    cpu: 33
    physical_processor: Intel Xeon Platinum 8175
    used_cores: 1
    total_cores: 26
    tdp: 165 # <-- output
```


### `teads-curve`

TEADs is a now very well-known set of [generalized power curve coefficients](https://medium.com/teads-engineering/building-an-aws-ec2-carbon-emissions-dataset-3f0fd76c98ac). Given a few inputs in can estimate the energy consumed for a given utilization. The coefficients are here for reference:

| util | coeff |
| ---- | ----- |
| Idle | 0.12  |
| 10   | 0.32  |
| 50   | 0.75  |
| 100  | 1.02  |

So if the TDP is 100W and the utilization is 50%, then according to the TEADs curve, the power would be 0.75 * 100 = 75W. The curve is generalized, so it is of limited usefulness in deciding which arch is better. Still, it is generalized enough to be used in many contexts where the data is limited.

Using a `teads-curve` model, we'd be able to estimate energy like so:

```yaml
observations: 
  - timestamp: 2023-07-06T00:00
    vendor: aws
    instance_type: m5d.large
    duration: 5 # <-- input
    cpu: 33 # <-- input
    physical_processor: Intel Xeon Platinum 8175
    used_cores: 1 # <-- input
    total_cores: 26 # <-- input
    tdp: 165 # <-- input
```

to

```yaml
observations: 
  - timestamp: 2023-07-06T00:00
    vendor: aws
    instance_type: m5d.large
    duration: 5
    cpu: 33
    physical_processor: Intel Xeon Platinum 8175
    used_cores: 1
    total_cores: 26
    tdp: 165 
    energy: 0.004 # <-- output
```

The energy used by this instance for 5s at 33% utilization is about 0.004 Wh.

## Use Cases

There are many advantages of composing a model pipeline from lots of smaller model plugins.
### Re-usability

Why implement some functionality in your model plugin if another is available that already implements the functionality you need, is widespread, and is well-supported? 

For example, several existing models (Boavizta, Cloud Carbon Footprint, and Climatiq, to name a few) all implement the same functionality to map cloud instance types, like `m5d.large`, to physical processors like `Intel Xeon Platinum 8175`. Internally, they are all doing the same thing, looking up what `m5d.large` is and what CPU microarchitecture it's linked to. However, the methodology they each use, the accuracy and recency of the data in the lookup tables, and how they fallback when no data is available differs

If a single model plugin existed, and all it did was map cloud instance types to microarchitectures and did that one job very well. Then other models may choose to rely on that one as a pre-requisite instead of implementing the functionality themselves:

```yaml
pipeline: instance-metadata | ccf
```


> [!important] Ecosystem of plugins
> The model plugins are the bulk of functionality for the impact engine. A small set of tightly focused model plugins can be combined in multiple ways to meet many use cases.

### Upgradability

Any time you upgrade one model plugin, every other plugin that depends on it can take advantage of those changes.

Sticking to the above example of the `instance-metadata` plugin. A new version of the `instance-metadata` plugin can be released if a cloud provider updates its instance types or offerings. If you update your install, every plugin that depends on that data can take advantage of the update.
### Consistency

Again, sticking to the  `instance-metadata` plugin example. Breaking out functionality into lots of smaller plugins allows for more consistency. This is especially true regarding plugins that do lookups against data. 

Rather than each plugin determining its own meta-data, one plugin can provide the metadata required for several subsequent plugins. From the data it exports to the observations, we can see what data every subsequent plugin is using.
### Debuggability

Since each model outputs a copy of its inputs, we can easily debug a calculation through its chain by dumping out the intermediate observations.
### Simulation

You can create models that **simulate** making changes to the system. For example, you could create a model called `change-instance-type`, which adjusts the data being passed through to **simulate** as if it was run on another cloud instance.

Through a set of simulation plugins, you can investigate **what if scenarios**, see the impact of work before investing any time, like so

```yaml
component:
  pipeline: "change-instance-type | instance-metadata | tdp | teads"
  config: 
    change-instance-type:
      to-instance: m5d.xlarge            
  observations: 
    - timestamp: 2023-07-06T00:00
      duration: 5
      cpu: 33
      vendor: aws
      instance_type: m5d.large
```

`change-instance-type` model would convert the above to this: 

```yaml
component:
  pipeline: "change-instance-type | instance-metadata | tdp | teads"
  config: 
    change-instance-type:
      to-instance: m5d.xlarge            
  observations: 
    - timestamp: 2023-07-06T00:00
      duration: 5
      cpu: 17.5 # <-- updated
      vendor: aws
      instance_type: m5d.xlarge # <-- updated
```

`m5d.xlarge` is the same CPU but twice the size of `m5d.large`, so this plugin halves the utilization to mirror what might be on the new instance type.

The rest of the pipeline would then be the same. No other plugin would need to be changed; they would all function as before. 

### Modelling Managed Services

We need to be able to measure the energy consumed by a processor since *eventually* everything is executed on a processor. However, these days most services are consumed through higher-level managed services (for example, AWS Lambda). In these managed services, you are abstracted away from the underlying processor, utilization, and instances. How do we measure the impacts of these managed services?

We first have to start with observations. If we take AWS Lambda (or any FaaS), then the observations we might receive are along the time/space dimension, like so:

```yaml       
observations: 
  - timestamp: 2023-07-06T00:00
    duration: 5
    gb-s: 1005
```

Most cloud FaaS measure by gigabyte seconds. So, the number of seconds your function runs for multiplied by the GB of memory it used in the same period. You don't know the underlying instance or the utilization.

There are no models *currently* that translate GB-s to energy and embodied carbon. However, by chaining several models together into a pipeline, we can *translate* GB-s to some equivalent utilization on an instance type and then compute using a similar pipeline to what we've used before.

Imagine we had an adaptor model called `aws-lambda-to-instance`, which transformed `gb-s` into an observation that can be computed using an existing set of models, like so:

```yaml
component:
  pipeline: "aws-lambda-to-instance | instance-metadata | tdp | teads"     
  observations: 
    - timestamp: 2023-07-06T00:00
      duration: 5
      gb-s: 1005
```

`aws-lambda-to-instance`  might first transform the observation to:

```yaml
component:
  pipeline: "aws-lambda-to-instance | instance-metadata | tdp | teads"     
  observations: 
    - timestamp: 2023-07-06T00:00
      duration: 5
      gb-s: 1005
      vendor: aws # <-- new
      instance_type: m5d.large  # <-- new
      cpu: 33   # <-- new
```

The observation is now in a format that can be computed using the rest of the pipeline.

Using **Managed Services Adaptor Models** (MSAM), we can quickly model higher-level managed services.

Another future is one where a model is created that directly translates `gb-s` to `energy`, perhaps maintained and released by AWS themselves, like so:

```yaml
component:
  pipeline: "aws-lambda"     
  observations: 
    - timestamp: 2023-07-06T00:00
      duration: 5
      gb-s: 1005
```

But with model pipelines we don't need to wait and in the meantime can fill in the gaps with adapter models,