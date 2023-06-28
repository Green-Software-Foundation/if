## Impact Measurement Plugin Specification

Calculating these impacts for every software component requires the use of an **Impact Measurement Model** (IMM). IMMs convert some input telemetry into some output impact metric, for example models that convert CPU Utilisation into Energy Consumption.

There are many different **Impact Measurement Models** (IMMs), [Boavizta](https://dataviz.boavizta.org/), [Cloud Carbon Footprint](https://github.com/cloud-carbon-footprint/ccf-coefficients), [Climatiq](https://www.climatiq.io/data) are some great examples of open-source IMMs, there are **many other** closed source, commercial and private models being built in-house inside organisations.

The set of IMMs are proliferating; however, no single IMM can possibly cover all impacts, scenarios, environments, contexts and use cases. To calculate the end-to-end impact of a software application you need to stitch together many different IMMs. IMMs differ in fundamental ways, in the inputs they accept, their interface, their calculation methodology, their outputs, their granularity, their coverage. 

We expect the choice of which IMM to use for which software component to come down to an expert decision by a software measurement professional.

Currently if you want to consume an IMM you are required to craft custom interfaces, since every software measurement use case is bespoke. Swapping one IMM for another requires code changes and comparing IMMs or validating their accuracy/precision is challenging. 

If every IMM **exposed the same interface**, then those models can easily be plugged in different applications, swapped in and out, upgraded, compared.

**Our thesis is simple, if we want there to be a large, vibrant, ecosystem of people and tooling around software impact measurement then we need a standard, common, interface to all Impact Measurement Models.**

The goal of the Impact Measurement Plugin (IMP) Spec is to define a common standardised interface to every IMM, current and future. 

# Impact Model Interface Specification 

The Impact Model Interface Specification project is here to standardise an interface to existing and future impact models (IMOs). The ecosystem of solutions we need for software measurement will sit on a solid bedrock of Impact Model Interfaces (IMIs) that have the same interface, to enable reusability, and comparability. 

Any class library that exposes the IMI interface adheres to this specification.

The interface describes the bidirectional communication between an IMO and what's calling the IMO. It describes the function signature, the data types and the exceptions used to pass back information to the caller.

This version of the specification does not pick any specific language, but it does assume the language has support for exception handling.

## Data Types

### StaticParams

This is a simple dictionary used to set up an IMM. Each IMM is different and can have a wide variety of parameters. The specification cannot define what these parameters will be, so we choose to have a simple data type of a dictionary which accepts all types and quantity of params.

### Telemetry

This is a unit of data to describe some inputs to an IMM. Since every IMM is different we can’t prescribe too much in the specification, however the only two fields that would be mandatory for each unit of telemetry is the date/time when the telemetry was gathered and the time-range for which the telemetry is for. For example, you might have some telemetry for CPU utilisation, but we also need to know when this telemetry was gathered and for what period of time does the telemetry measure.

Telemetry can be aggregate or granular, for example it might contain an average of cpu utilization across a range of machines.

`{ “date-time”: xxxx, “duration”: xxx, “cpu-util”: 0.5 }`

Or it might contain more granular data for every machine like so:

`{ “date-time”: xxxx, “duration”: xxx, machines: { “gsf-001”: “cpu-util”: 0.5, “gsf-002”:  “cpu-util”: 0.62 } }`

Or it might contain even more granular data to the process level:

`{ “date-time”: xxxx, “duration”: xxx, machines: { “gsf-001”: { processes: { “process-001”: “cpu-util”: 0.5 } }  }`

This is just an example to demonstrate just how wide a variety of data there can be for Telemetry, there may be an infinite variety of inputs here. The Telemetry is really defined by the IMM, if the IMM does per processes modelling then the Telemetry can provide per process data.

### TelemetryStream

This data type returns a stream of Telemetry objects, used when we want to calculate impact metrics in real-time.

### ImpactModel

This datatype holds the instance for an IMO.

### ImpactMetric

This datatype holds the results of an IMM model call, the estimated energy, carbon, water values. It also might contain information about the calculation for debugging purposes.

Whereas the Telemetry can vary wildly depending on IMM, we do need to normalise all ImpactMetrics into a common data type with a common structure. This will be an area of focus as we build out more IMPs using the spec.

### ImpactMetricStream

This data type returns a stream of ImpactMetrics to use in a real-time monitoring context.

## Exceptions

* **MissingStaticParams**: Some static params are not available.
* **IncorrectStaticParams**: A param has been input but the value is weird, incorrect to just doesn't work with this model.
* **ExternalError**: Some other problem with perhaps an external service, networking, disk etc…


## Class Interface

```ts
interface ImpactModelInterface {
  public static create(name: string, params: StaticParams): ImpactModelInterface
  public authenticate(authParams: AuthParams): void
  public snapshot(telemetry: Telemetry): ImpactMetric
  public batch(batchTelemetry: Array<Telemetry>): Array<ImpactMetric>
  public stream(streamTelemetry: TelemetryStream): ImpactMetricStream
}
```

### Create

#### Signature

```ts
public static create(name: string, params: StaticParams): ImpactModelInterface
```

#### Example usage

```ts
class ConcreteVM extends ImpactModelInterface { ... }

let model = ConcreteVM.create("backend-server", {vendor: "GCP"});
```

#### Responsibilities

* Instantiates an Impact Model which exposed the Impact Model Interface through a factory `create` function
* Performs validation on any of the input static parameters. Each model is different,and will require a different set of input static params but at the same time we need each model to expose the same function signature. If you are passing incorrect params the model will inform you through
* Performs any setup work for the model.
* This step is necessary before any other function call in the spec..
* Return an instance to the Impact Model which holds any required state.

#### Parameters

* **name** this is a simple string identifier so we can distinguish and refer to this model separate from others.
* **params** this is a dictionary of StaticParams that are required to set up this model. Each model is different and can have a variety of parameters, the specification cannot define what these parameters will be so we choose to have a simple data type of a dictionary.

#### Returns

An instance of an **Impact Model Plugin** which exposes the **Impact Model Interface** which holds any state for this model.

#### Raises

* `MissingStaticParams`
* `IncorrectStaticParams`
* `ExternalError`

### Authentication


#### Signature

```ts
public authenticate(authParams: AuthParams): void
```

#### Example usage

```ts
class ConcreteVM extends ImpactModelInterface { ... }
let model = ConcreteVM.create("backend-server", {vendor: "GCP"});
try {
    model.authenticate({username: "XXXX", password: "YYYY"})
} catch AuthenticationError e {
    ...
}
```

#### Responsibilities

* This is an optional call to perform any authentication to use the model.
* Some carbon models might be provided to users only through a commercial agreement or through an NDA. 
* To restrict access to that we need to have an authentication mechanism.
* The spec does not currently prescribe a particular authentication mechanism which is again why it accepts multiple varied params to support multiple authentication methods.

#### Parameters

* **authParams** this is a dictionary of AuthenticationParams, exact params depend on the authentication mechanism this model adopts but could be simple username/password, an API key or some other method.

#### Returns

Nothing. 

#### Raises

* `AuthenticationError`
* `ExternalError`

### Snapshot

This function estimates the emissions based on the telemetry provided for a single range of time.


#### Signature

```ts
public snapshot(telemetry: Telemetry): ImpactMetric
```

#### Example usage

```ts
class ConcreteVM extends ImpactModelInterface { ... }
let model = ConcreteVM.create("backend-server", {vendor: "GCP"});
try {
    let impact = model.snapshot({“date-time”: xxxx, “duration”: xxx, “cpu-util”: 0.5});
    console.log(impact);
} catch {
    ...
}
```

#### Responsibilities

* Checked that the telemetry has all the required fields for this model.
* Performs what validations it can that the provided telemetry is not malformed.
* Passes the telemetry to the underlying carbon model, executes the model and translates the response to match theEmissionsData data type.

#### Parameters

* **telemetry** this is a dictionary of Telemetry. Each model can work with different types of telemetry, the spec cannot predict what types of telemetry will be used by all models so the telemetry is in the form of a Dict. 


#### Returns

An instance of an `ImpactMetric` which holds the estimate of emissions.

#### Raises

* `NotAuthorized`
* `MissingTelemetry`
* `MalformedTelemetry`
* `ExternalError`

### Batch

This function estimates the emissions for a batch of telemetry units, effectively the equivalent of calling a snapshot multiple times. The underlying implementation might be very different, however.

You’d use this function once you’ve gathered some historical telemetry data from your system to see what the emissions of the systems were over that historical time period.

This is the first step to simulating some options, once you have a baseline of emissions over that historical period, then you can ask “what if” questions, adjust the model and see how the emissions would have changed over that same historical period.


#### Signature


```ts
public batch(batchTelemetry: Array<Telemetry>): Array<ImpactMetric>
```

#### Example usage

```ts
class ConcreteVM extends ImpactModelInterface { ... }
let model = ConcreteVM.create("backend-server", {vendor: "GCP"});
try {
    let batchTelemetry = [
        {“date-time”: xxxx, “duration”: xxx, “cpu-util”: 0.5},
        {“date-time”: xxxx, “duration”: xxx, “cpu-util”: 0.2}
        {“date-time”: xxxx, “duration”: xxx, “cpu-util”: 0.1}
        {“date-time”: xxxx, “duration”: xxx, “cpu-util”: 0.93}
    ];

    let impacts = model.batch(batchTelemetry);

    for (let impact of impacts) {
        console.log(impact);
    }
    
} catch {
    ...
}
```

#### Responsibilities

* Checked that the array of telemetry has all the required fields for this model.
* Performs what validations it can that the provided telemetry is not malformed.
* Calls the underlying carbon model and for each passed input of telemetry outputs a similar unit of emissions data.


#### Parameters

* **batchTelemetry** is an array of Telemetry data types, each unit of telemetry here is for a single time range.

#### Returns

An array of `ImpactMetrics`, each instance matches 1 for 1 an instance of `Telemetry` passed in.

#### Raises

* `NotAuthorized`
* `MissingTelemetry`
* `MalformedTelemetry`
* `ExternalError`


### Stream

This function calculates the emissions in realt-time for a stream of telemetry which is being passed in.

Typically, this function would be used to monitor the emissions using the model in real-time. The input stream of telemetry would need to be sourced from some system, e.g. prometheus, a collector, agent, platform of some form. 

The output ImpactMetricStream you might connect to the next step in the pipeline and send the emissions data somewhere to be processed by the next step, for example perhaps an alerting system to alert when the carbon emissions exceed a particular threshold.


#### Signature


```ts
public stream(streamTelemetry: TelemetryStream): ImpactMetricStream
```

#### Example usage

```ts
class ConcreteVM extends ImpactModelInterface { ... }
let model = ConcreteVM.create("backend-server", {vendor: "GCP"});
try {
    // Some form of stream reader which reads utilization live from GCP monitoring system- and streams back to us
    let streamTelemetry = new GCPTelemetryReader("backend-server", ... );

    let impactStream = model.stream(streamTelemetry);

    let impact: ImpactMetric;
    while (impact = impactStream.read()) {
        console.log(impact)
    }    
} catch {
    ...
}
```

#### Responsibilities

* Checks each Telemetry object has all the required fields.
* Performs what validations it can that the provided telemetry is not malformed.
* Reads from the stream object, and for every new object it calls effectively the snapshot function and returns in the response stream.

#### Parameters

* **streamTelemetry **is an object that returns a Telemetry object from a stream.

#### Returns

An instance of `ImpactMetricStream`.

#### Raises

* `NotAuthorized`
* `MissingTelemetry`
* `MalformedTelemetry`
* `ExternalError`

