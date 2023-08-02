**Status**: Draft
**Author**: Asim Hussain (@jawache)
**Abstract**: An impact graph is the core construct in an Impact Engine Framework through which all the other components interact.

## Introduction

An Impact Graph is a manifest that defines everything you need to calculate the environmental impact of a piece of software. 

You can describe it in YAML format (impl) and execute using a command line tool (rimpl) using static input data (observations). It can output a single value or a time series of impacts so you can narrow down the moments of peak environmental impacts. It can also be constructed in code using the IEF SDK for use cases where real-time streaming or monitoring of impacts is required.

It allows you to evolve, start course grained for a fast high-level impact calculation, and then add granularity (structural and temporal) over time to dig deeper and identify the areas that drive the most impacts.

It's incredibly flexible. Using plugins, you can configure it to calculate any environmental impact (carbon, water, energy) for any calculation methodology (sci, ghg, others).

The flexibility of impact graphs means they can represent a running software application, a user journey, or a campaign - it should be possible to measure anything with an impact graph. We call the thing an Impact Graph is measuring an **Impact Subject**.

It represents an Ontology of a software system—a graph of all the nested components and sub-components.

Impact Graph is the core of the Impact Engine Framework.

## Structure

See the [Impact YAML](design/Impact%20YAML.md) spec for the latest and complete information regarding the structure of an Impact Graph.

In summary, an Impact Graph has a root node containing configuration detailing **how** the graph is computed and a graph node containing details about all the components that make up this impact subject.

The graph's leaf nodes (**Components**) represent the components that need impacts calculated, e.g. servers, networking, and devices.

The intermediate nodes (**Groupings**) represent a grouping of leaf nodes for useful aggregation, e.g. **backend** intermediate node might contain all the leaf nodes for the backend components.

![](attachment/3f18767c1a55cee416e3de70314609e3.png)


### Component

Each component has some configuration, some observations, and a model.
- **Configuration** describes shared information regarding this component and, most importantly, parameters required by this model.
- **Observations** are a time series of data points used as inputs to the model.
- **Model** is a plugin ([Impact Model Plugin](design/Impact%20Model%20Plugin.md)) which when given some configuration and a series of [Observations](design/Observations.md), can calculate the impact, e.g. carbon impact from an observation of CPU utilization.

![](attachment/decc58c3420d1e4e3701e5d1ac12883e.png)


### Computation

During graph computation, we first calculate the Component nodes to generate Impact Metrics. Then we aggregate the Impact Metrics up the tree to any Grouping nodes and, finally, a total Impact Metric for the whole graph. Every node in the graph has an impact metric; this means you can analyze a system as a who but also dig into and analyze the impacts of its components.

![](attachment/bcb0066204a750f6b18a43a627c66b90.png)


A computation of an Impact Graph can create one Impact Metric. It can also be configured to return a **time series of impacts**, so you can identify the moments when impact is higher or lower. Importantly a time series is computed for every node (grouping or component) in the graph so that you can analyze the source of impact structurally and temporally.

### Pipeline

See [Impact Graph Pipeline](design/Impact%20Graph%20Pipeline.md) for details regarding the phases of an Impact Graph Computation. 

In summary, there are 4 phases:
- **Calculation**: Calculating the impacts of every component leaf node.
- **Enrichment**: Enriching the impacts, e.g. calculating the carbon from energy using grid emissions data.
- **Normalization**: Bucketing the impacts into a time series of impact durations.
- **Aggregation**: Aggregating the impacts by each impact duration, up the graph, to the parent nodes and finally, the root node 

Through the above pipeline process, we can handle multiple types of calculations. To see how we can calculate an SCI score, see [Computing SCI Scores](Computing%20SCI%20Scores).

## Supporting the 4M's of Green Software

We can apply the [4Ms](4Ms) using an Impact Graph.

- **Model**: Define clearly what you want to measure, the *boundary* of the subject.
- **Measure**: So you can know the subject's impact.
- **siMulate**: *Estimate* the change to the impact metric of making changes to the subject.
- **Monitor**: Measure impacts more frequently, so you tighten the feedback loop and iterate faster towards lower impacts.

Creating a graph involves **modeling** a subject you want to measure, simulate and monitor. It could be a software application, a user journey, campaign. Modeling involves adding nodes to the graph, both component and grouping nodes.

**Measuring** involves selecting and configuring the correct measurement plugins for each component in the graph and collecting observations to pass to those plugins.

Once both steps are complete and you have a baseline, *computable*, model of your graph's impacts, you can start **simulating** the effects of making changes. You can change the model to represent a *what if* scenario (e.g. changing part of the architecture or runtime of your software), compute the new simulation graph, and see how much this affects the overall impact without making any changes to your software.

So far, graph computations are batch processes that start and end with static observations embedded. Since the graph represents executable code that takes in some observations to generate outputs impacts, it's possible to turn a graph calculation into a continuous process to **monitor** the impacts of your subject. Something that takes a stream of observations in and exhausts a stream of output impacts.

### Evolution

One of the most valuable features of a graph is that it can grow and evolve; it can start small and grow in complexity over time. 

We need to add [Granularity](design/Granularity.md) to a graph to get the most out of this process. The more granular a graph is, the more accurate the impacts will be. The more granular a graph, the more opportunities to simulate present themselves. 

Most graphs might begin life as **one** component node and **one** observation. This will give you a single impact.

Once you desire to see the impacts over time, you might evolve the graph by adding multiple observations. 

Once you want to see the impacts broken down by sub-components, you evolve the graph by adding more components.

The graph can start very simple and grow very complex, but only as complicated as you need to answer your questions and no more.

### Example

A high level example of how we might model the carbon impact of a subject such as a web server using a **graph**.

```
My Web Server Impact Graph
```

First, we create a **graph** that models the software boundary we want to measure. 

```
My Web Server Impact Graph
├── Backend Server
├── Load Balancer
└── Cache Servers
```

The important thing is that nodes in the graph are separate and distinct measurable parts of the whole. You don't need to have nodes that map to the architectural topology of your system. You create nodes because you want to measure some aspect of the system; if you're happy to lump all backend services into one component since you don't need to measure them individually, you can leave them all as one "backend servers" node.

A **graph node** is something we want to measure distinct from every other node in the graph. We can clump all the servers together into one node regardless of what's running on them IF we want to measure them all together. If we want to measure per-process, we can break it up into one node per-process. The node describes a thing we want to measure; that's it.

There are two types of nodes, grouping nodes and component nodes. Only the leaves of the graph can be component nodes.

```
My Web Server Impact Graph
├── Backend Server <--> Boavista Model
├── Load Balencer <--> Boavista Model
└── Cache Servers <--> Intel Model
```

The next step is determining which **Impact Measurement Models** we want to use to calculate each **Component**. In the above example, we want to use Boavizta's **model** to measure the Backend Server and Load Balancer because those run on various types of underlying hardware. However, The cache servers might only be running on Intel, and if we have access to an Intel Model that is more accurate for Intel products, we may choose to use that. 

To interact with each **model**, we use an **Impact Measurement Plugin**, which is just a class that extends the **Impact Measurement Interface** and implements the functions in the interface.

Every **model** we want to use inside a **graph** needs a **plugin** that implements a standard interface. 

It's therefore easier (although not guaranteed to be without *some* effort) to swap out measurement models by simply changing your plugin.

1. install the Cloud Carbon Footprint Plugin.
2. import it
3. use the Cloud Carbon Footprint Plugin instead of the Boavizta Plugin.

```
My Web Server Impact Graph
├── Backend Server <--> CCF Model
├── Load Balencer <--> CCF Model
└── Cache Servers <--> Intel Model.
```

