---
author: Asim Hussain (@jawache)
abstract: Standardising the interface to measurement models.
---
# Impact Model Plugin

Calculating [Impact Metric](Impact%20Metric) 's (outputs) for every component in an [Impact Graph](Impact%20Graph.md) (graph) requires the use of an **Impact Model** (model) called through an [Impact Model Plugin](Impact%20Model%20Plugin.md) (model plugin).

## What are Impact Models?

A model converts an input [input](input.md) into some output [Impact Metric](Impact%20Metric), for example, models that convert an input of CPU utilization into an impact of energy.

There are many different **models**, [Boavizta](https://dataviz.boavizta.org/), [Cloud Carbon Footprint](https://github.com/cloud-carbon-footprint/ccf-coefficients), [Climatiq](https://www.climatiq.io/data) are some great examples of open-source IMs, there are **many other** closed source, commercial and private models being built in-house inside organizations.

The set of models is increasing; however, no single model can cover all impacts, scenarios, environments, contexts, and use cases. To calculate the end-to-end impact of a software application, you need to stitch together many different models. Models differ in fundamental ways in the inputs inputs they accept, their interface, their calculation methodology, their outputs, their granularity, and their coverage. 
	
We expect the choice of which model to use for which software component to come down to an expert decision by a green software professional.

## Why do we need to standardize the interface to models?

Currently, suppose you want to consume a model in your measurement application. In that case, you must craft custom code to interact with a custom interface since every model has its unique interface. Swapping one model for another requires code changes, and comparing models or validating their accuracy/precision is challenging. 

If every model **exposed the same interface**, then those models can easily be plugged into different applications, swapped in and out, upgraded, and compared. 

**Our thesis is simple: if we want a large, vibrant ecosystem of people and tooling around measurement, we need a standard, common interface for all models.**

> Ecosystems grow and thrive through standards.

This Impact Model Plugin Spec aims to define a common standardized interface to every model, current and future. 

## Specification 

The Impact Model Plugin Specification project is here to standardize an interface to existing and future impact models.

The interface describes the bidirectional communication between a plugin and what's calling the plugin. It describes the function signature, the data types, and the exceptions used to pass back information to the caller.

This specification version does not pick any specific language, but it assumes the language is OO and has support for exception handling.

## Data Types

### Configuration

This is a simple dictionary used to set up a model. Each model is different and can have a wide variety of parameters. The specification cannot define these parameters, so we choose a simple dictionary data type that accepts all types and quantities of parameters.

### input

- An [input](input.md) is a data unit describing some inputs to a model. 
- Since every model differs, we can only specify a little. However, the only two fields that would be mandatory for each input are the date/time when the measurement was gathered and the duration for which the input is valid. 
- For example, you might have some input for CPU utilization, but we also need to know when this input was gathered and for what period the input spans.

> ![note] We will likely need to add a location for grid emissions enrichment and also something regarding the context in which it was measured (e.g., utilization on a ten-year-old chip won't match utilization on a 2023 processor)
### ImpactMetric

This data type holds the results of a model call, the estimated energy, carbon, and water values. It also might contain information about the calculation for debugging purposes. 

## Exceptions

* **MissingConfig**: Some static parameters are not available.
* **IncorrectConfig**: A param has been input, but the value is weird, incorrect, or doesn't work with this model.
* **ExternalError**: Other problems with an external service, networking, disk, etc.


## Class Interface

```ts
interface ImpactModelPluginInterface {
  public configure(name: string, config: Configuration): ImpactModelPluginInterface
  public authenticate(authParams: AuthParams): void
  public calculate(inputs: Arrray<input>): Array<ImpactMetric>
}
```

### Configure

#### Signature

```ts
public configure(name: string, config: Configuration): ImpactModelPluginInterface
```

#### Example usage

```ts
class ConcreteVM extends ImpactModelPluginInterface { ... }

let model = new ConcreteVM().configure("backend-server", {vendor: "GCP"});
```

#### Responsibilities

_Due to the limitations of the JSII interface, we cannot use static methods and factory patterns._

* Configures an instantiated instance. 
* Performs validation on any of the input static parameters. Each model is different and will require a different set of input static parameters, but at the same time, we need each model to expose the same function signature. If you are passing incorrect params, the model will inform you through
* Performs any setup work for the model.
* This step is necessary before any other function call in the spec.
* Return an instance to the Impact Model, which holds any required state.

#### Parameters

* **name** is a simple string identifier, so we can distinguish and refer to this model separately from others.
* **config** is a dictionary of Configuration required to set up this model. Each model is different and can have a variety of parameters; the specification cannot define what these parameters will be, so we choose to have a simple data type of a dictionary.

#### Returns

An instance of an **Impact Model Plugin** exposes the **Impact Model Plugin Interface**, which holds any state for this model.

#### Raises

* `MissingConfig`
* `IncorrectConfig`
* `ExternalError`

### Authentication


#### Signature

```ts
public authenticate(authParams: AuthParams): void
```

#### Example usage

```ts
class ConcreteVM extends ImpactModelPluginInterface { ... }
let model = new ConcreteVM().configure("backend-server", {vendor: "GCP"});
try {
    model.authenticate({username: "XXXX", password: "YYYY"})
} catch AuthenticationError e {
    ...
}
```

#### Responsibilities

* This is an optional call to authenticate using the model.
* Some carbon models might be provided to users only through a commercial agreement or through an NDA. 
* To restrict access to that, we need to have an authentication mechanism.
* The spec does not currently prescribe a particular authentication mechanism, so it accepts multiple parameters to support multiple authentication methods.

#### Parameters

* **authParams** This is a dictionary of AuthenticationParams. Exact params depend on this model's authentication mechanism but could be a simple username/password, an API key, or another method.

#### Returns

Nothing. 

#### Raises

* `AuthenticationError`
* `ExternalError`

### Calculate

This function estimates the emissions based on a single input input. For each input input, we calculate one output Impact Metric. inputs and Impact Metrics have a 1-1 mapping and relationship.

#### Signature

```ts
public calculate(inputs: Array<input>): Arrray<ImpactMetric>
```

#### Example usage

```ts
class ConcreteVM extends ImpactModelInterface { ... }
let model = new ConcreteVM().configure("backend-server", {vendor: "GCP"});
try {
    let input = {“date-time”: xxxx, “duration”: xxx, “cpu-util”: 0.5};
    let outputs = model.calculate([input]);
    console.log(outputs);
} catch {
    ...
}
```

#### Responsibilities

* Checked that the passed in inputs have all the required fields for this model.
* Performs what validations it can that the provided inputs are not malformed.
* Passes the inputs to the underlying carbon model, executes the model, and translates the response to match the emissions data type.

#### Parameters

* **inputs** 
  * This is an array of inputs. 
  * Each model can work with different types of inputs; the spec cannot predict what kinds of inputs will be used by all models, so we need to keep this very open. 
  * It's an array since we will (in the future) need to deal with GridEMissions (`I`), and that requires input data in a fine grain to make sure we map to `I` at the same granularity. E.g., we might want to output carbon per hour, but the input energy data is in 5min increments so that we can make the grid emissions in the same 5 min increments.

#### Returns

An array of instances of an `ImpactMetric` holds the estimate of emissions.

#### Raises

* `NotAuthorized`
* `MissingTelemetry`
* `MalformedTelemetry`
* `ExternalError`