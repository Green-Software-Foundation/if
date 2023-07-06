# Impact Graph: A Software Impact Model

If you can’t measure, you can’t improve. Software has many negative environmental **impacts** which we need to optimize, carbon, water, energy to name just a few.

Unfortunately, measuring software impact metrics like carbon, water, energy is complex and very nuanced. 

Modern applications are composed of many smaller pieces of software (components) running on many different environments, for example, private cloud, public cloud, bare-metal, virtualized, containerized, mobile, laptops, desktops, embedded, IoT. Many components that make up a typical software application are not run on resources you own or control, which makes including the impact of managed services in your measurement especially hard. 

- How we model the environmental impacts of a complex application is through the creation of an **Impact Graph** which represents and models the thing we want to measure. 
- Each **Impact Graph Node** in the graph represents one atomic thing we want to measure, it could be a software component, or part of the user joruney. 
- To measure the environmental impact of one of the nodes in an **Impact Graph** we use a **Impant Mesurement Model**. 
- There are many **Impact Measurement Models** out there and they all have different interfaces, some are APIs some are libraries, some are just CSV files. 
- Since every **Impact Measurement Model** is bespoke to make them all interoperable we write **Impact Measurement Plugins** which adhere to a common **Impact Measurement Interface** specification.

### Example

Concrete example of how we might model the carbon impact of a web server using an **Impact Graph**.

```
My Web Server Impact Graph
```

We first create an **Impact Graph** that describes the software boundary we want to measure. The software boundary is represented as an ontology. This might be an application like this case which is a Web Server, but it also might be a campaign or even an individual user journey. It could even be used to measure the embodied carbon of physical devices. What we are proposing here isn't limited to just software.

```
My Web Server Impact Graph
├── Backend Server
├── Load Balencer
└── Cache Servers
```

We second break out the ontology into the nodes which we want to measure. The important thing is that we are breaking things out not as concepts, but as seperate and distint measurable components of the whole. 

An **Impact Graph Node (IGN)** is something we want to measure distinct from every other node in the Impact Graph. That's it, we can clump all the servers together into one IGN regardless of what's running on them IF we want to measure them all together. We can break it up into one IGN per-process IF we want to measure per-process. The IGN describes an atomic thing we want to measure, that's it.

What this means is that although a component might be "Backend Servers" since we'd use different approaches to measure "Intel Backend Servers" and "AMD Backend Servers" we might actually break it out into two IGNs, "AMD Backend Servers" and "Intel Backend Servers". This sounds complex but since our goal is to measure, measuring dictates how we strucutre the graph.

```
My Web Server Impact Graph
├── Backend Server <- class BoavistaVM extends IMI -> Boavista IMM
├── Load Balencer <- class BoavistaVM extends IMI -> Boavista IMM
└── Cache Servers <- class IntelVM extends IMI -> Intel IMM
```

The next step is figuring out which **Impact Measurement Models** we want to use to measure each **Impact Graph Node**. In the above example we want to use Boavista's **Impact Measurement Model** to measure the Backend Server and Load Balencer because those are runing on a mixture of different types of underlying chips. The cache servers might however only be running on Intel Chips and therefore we may want to use Intels IMM since it's more accurate for Intel products. To interact with each IMM we use an **Impact Measurement Plugin** which is just a class that extends the **Impact Measurement Interface** and implements the functions in the interface.

If later on we wanted to use another IMM, perhaps the Cloud Carbon Footprint IMM, we would 

1. install the CCF package
2. import it
3. use the CCF class instead of the Boavista class.

```
My Web Server Impact Graph
├── Backend Server <- class CCFVM extends IMI -> CCF IMM
├── Load Balencer <- class CCFVM extends IMI -> CCF IMM
└── Cache Servers <- class IntelVM extends IMI -> Intel IMM.
```


All IMPs expose the same class Interface (IMI) so can be swapped in and out easily.

### Measuring Impact

Once we've created our **Impact Graph** we want it to calcualte some **Impact Metric**.

Each **IMM** given some imput **Telemetry** returns some output **Impact Metric**, e.g. carbon, energy.

We pump in telemety into each **IGN** in the **IG**

```
My Web Server Impact Graph
├── Backend Server --> Telemetry --> BoavistaIMP --> BoavistaIMM
├── Load Balencer --> Telemetry --> BoavistaIMP --> BoavistaIMM
└── Cache Servers --> Telemetry --> IntelIMP --> IntelIMM
```

The **IMPs** calcualtes an **Impact Metric** for each node in the graph which is summed up the graph to the root node like so.

```
My Web Server Impact Graph {Eneregy: 280 mWh}
├── Backend Server {Enegy: 24 mWh}
├── Load Balencer {Enegy: 14 mWh}
└── Cache Servers {Enegy: 242 mWh}
```

Graphs can be very complex, using this approach we can both calcualte the impact of every node in the graph but also the total for the whole graph. 

## You can model anything with Impact Graphs

A graph can represent an application like above, but can also represent concepts for example a campaign to measure and monitor the carbon emissions from storage of data across an organization.

```
Company Wide Storage Emissions
├── Outlook
├── DropBox
├── Azure Storage
└── One Drive
```

As long as IMMs existed to model the carbon emissions of storage on these mediums, then we could models the emissons of an enture companies storage with an IG like so.

```
Company Wide Storage Emissions
├── Outlook <- class Outlook extends IMI -> Microsoft IMM
├── DropBox <- class DropBox extends IMI -> DropBox IMM
├── Azure Storage <- class AzureStorage extends IMI -> Microsoft IMM
└── One Drive <- class OneDrive extends IMI -> Microsoft IMM
```

As long as IMMs exist to represent the different Nodes in your Graph, you can **measure anything in the world**. The limitation is the availabilty of IMM's.

## Impact Graphs can also be Impact Measurement Models!

This is key, from jsut a few IMMs we can create many others that model and measure many different types of software components. 

Let's imagine your application uses a 3rd party SaaS product called GroatAPI. 

You're creating an **Impact Graph** for your application, but for the **Impact Graph Node** for the GroatAPI component you don't have any **IMM** you can use.

```
My App
├── Servers <- class BoavistaVM extends IMI -> Boavizta IMM
├── Groat API <- class GroatIMM extends IMI -> ????????????
├── Networking <- class GenericNetworking extends IMI -> GSF Generic IMM
└── Mobile App <- class Climatiq extends IMI -> Climatiq IMM
```

You can create an **Impact Graph** that models how you think GroatAPI could be setup and estimates it's emissions.

```
Groat API
├── Servers <- class BoavistaVM extends IMI -> Boavizta IMM
├── Caching Layer <- class BoavistaVM extends IMI -> Boavizta IMM
├── Networking <- class GenericNetworking extends IMI -> GSF Generic IMM
└── Load Balencer <- class BoavistaVM extends IMI -> BoavistaVM IMM
```

That Groat API Impact Graph could then be wrapped in an IMP 

```ts
class GroatIMP extends ImpactMeasurmentInterface {
    public snapshot(telemetry: Telemetry) {
        Groat API
        ├── Servers <-> BoavistaIMP <-> Boavizta IMM
        ├── Caching Layer <-> BoavistaIMP <-> Boavizta IMM
        ├── Networking <-> GenericNetworkingIMP <-> GSF Generic IMM
        └── Load Balencer <-> BoavistaIMP <-> Boavizta IMM
    }
}
```

and then used it in your Impact Graph for your Groat API IGN.

```
My App
├── Servers <-> BoavistaIMP <-> BoaviztaIMM
├── Groat API <-> GroatIMP <-> GroatImpactGraph
├── Networking <-> GenericNetworkingIMP <-> GSFGenericIMM
└── Mobile App <-> ClimatiqIMP <-> ClimatiqIMM
```

Imagine a future where 1000's of Community Impact Modellers create Open Source Impact Graphs for everything. You'd have a vibrant ecosystem of IMMsfrom which to pick and choose to model any software application, campaign or user journy. 

We'd no longer be limited by what data organisations release, we'd be able to create a huge ecosystem of community generated IMMs for everything imaginable.

## Terminology

**Impact Metric**: An impact is some environmental metric that you would like to optimise, for example carbon, water, energy.

**Impact Graph (IG)**: Is a graph of nodes that defines an ontology we want to model, for example an application, a campaign, a user journey. Each node in the graph uses an Impact Model, a way to calculate the emissions of that node.

**Impact Measurement Model (IMM)**: Is a model that given some input telemetry returns some output impact metric. For example, if input some CPU utilisation, it might be a model that translate that into an estimate of energy consumed.

**Impact Measurement Plugin (IMP)**: Is a class, a package, module. It's code you download and install onto your computer with say `pip install`, or `npm install` which let's you interact with an IMM. For example the `CloudCarbonFootprintPlugin` is a package you install into you computer, then if you import `CloudCarbonFootprintPlugin` into your code you can instantiate a class called `CloudCarbonFootprintPlugin`. You call member functions on that class instance to use the `CloudCarbonFootprint` IMM.

**Impact Model Interface (IMI)**: Is a common class interface that every IMP needs to extend and implement. Every IMP might be very different from each other, but all of them share the same basic interface, the IMI interface. By sharing that same interface we can easily compare, swap, use one IMP or another since they all expose the same interface.

For example we might have several IMM's each one with a unique methodology of calculation, scope, granularity, interface. To make each of these IMM's interoperable they each have to expose a software module which adheres to the IMI spec, this is called an IMP. Then to use an IMM all you need to do is to install the software module IMP for that IMM. All the software modules expose the same interface so you can swap them out easily.

## Background

This project has evolved over the 2 years of the GSFs existence. 

During the development of the SCI, we acknowledged that the single biggest blocker to adoption of the SCI was access to data, models, that can be used to calculate the values of different components.

We then launched the sci-data project to help create the data sets required to calculate an SCI score.

The original sci-data team quickly realised after some discussions and investigation that there were in fact quite a few existing data sets, the challenge wasn’t sourcing them, it was knowing which data set to use for which use case. How data set differed from each other in their methodology and interface. When to use one over the other, the pros/cons and trade-offs.

The project evolved into the sci-guide then to documenting existing data sets, providing guidance for when to use one over another, how to use it to create your own software measurement reports.

Finally, we had enough information and SCI use cases started to be written, this was a milestone moment.

But now we are in the next evolution, to have software measurement be a mainstream activity, for this to be an industry with 1000’s of professional software impact measurement experts, for business to grow and thrive in a commercial software measurement ecosystem we need to formalise software measurement into a discipline, with its own standards, methodologies, tooling.

## Technical Requirements

* IMMs have different inputs, some use billing data, some use utilization - the IMP interface needs to be flexible to accommodate all the existing types of inputs that we know of and all the future types of inputs we don’t know of.
* IMPs should be muti-language. For the alpha version we can perhaps explore Python and Node.js and therefore make assumptions assuming those language features. But once it goes into a v1.0 stage it should support a broad range of languages.
* Using an IMP should be very quick, from installing an IMP module to consuming the IMP in code should take no longer than a few mins. There may be certain implementations of IMPs that take longer, but the specification shouldn’t have any features which slow down the loading of an IMP. 
* Every IMP implementation should have the same function signature and communicate to the calling context in the same way. So swapping one IMP for another might just require one line of code change and every use of that model is the same across your application.
* Where possible IMPs should be able to return a verbose explanation of how the impact metric was calculated, the workings out and intermediate values. For debugging.
* IMMs and by extension IMPs might need different inputs, e.g. one might take as input billing data another cpu utilisation. IMPs will need to provide very detailed instructions to the developer for what data they need to function. E.g., you might swap out one IMP for another similar one but the new one requires one more config param. The IMP should return clear errors to the developer, so they know what to do to resolve.
* IMPs may need to be stateful, e.g., cache locally a set of coefficients from a network file.


## User Stories

As an impact modler I want to be able to measure the sci score of a user journey.

As an impact modler I want to be able to measure the sci sciore of an application.

As an impact modler I want to be able to measure the water consumption of an application.

As an impact modler I want to be able to measure the sci score of a third party service I'm consumiong, like a database.

## In Scope / Out of Scope

* This project is NOT going to create new IMMs, this project will create a common interface to existing IMMs so they can be more easily consumed, swapped out, compared, upgraded.
* Through creating a common interface and hopefully eventually library of carbon models that can be easily consumed by developers we probably will identify gaps, models that are needed and don't exist.
* By just being able to swap out the model and keeping the rest of the code the same we'll be able to see the difference more easily between models and when one is more suitable than another.
* As organizations are increasingly going to create their own private, NDA models, as long as they adhere to the interface, we describe below they will bne able to use the models in any application/framework that supports CQL model interfaces.
