# Terminology

> [!tip] 
> Since the term **Impact** is used in many places in the framework, its often a practice in the documentation to leave it out of the name, e.g. Impact Graph is often just called a Graph. This is true for everything except Impact Metric, the short form of Impact Metric is usually just Impact or Impacts.

### Impact Metric
**aka:** *impact*
An impact is some environmental metric that you would like to measure, for example carbon, water, energy.

### Impact Subject
**aka**: *subject*
This is the *thing* an we are measuring the environmental impact of, for example a software application, a user journey, a campaign.

### Impact Graph 
**aka:** *graph*
Is a graph of nodes that defines an ontology we want to model, for example an application, a campaign, a user journey. 

### Impact Model
**aka:** *model*
Is a model that given some input inputs returns some output impact metric. For example, if input some CPU utilization, it might be a model that translate that into an estimate of energy consumed. Some examples of impact models are Boavizta, Cloud Carbon Footprint and Climatiq.

### Impact Model Plugin
**aka**: *imp*, *model plugin*, *plugin*
Is a software package/module external to the [Impact Engine Framework](spec/Impact%20Engine%20Framework.md) exposing a class implementing the Model Plugin Interface. It's code you download and install which let's you interact with an [Impact Model](Impact%20Model) in a standard way.

### Impact Model Interface
**aka**: *model interface*
Is a common class interface that every [Impact Model Plugin](spec/Impact%20Model%20Plugin.md) needs to extend and implement. Every [Impact Model](Impact%20Model) might be very different from each other, but through an [Impact Model Plugin](spec/Impact%20Model%20Plugin.md) that implements the same interface. By sharing that same interface we can easily compare, swap, use one plugin or another since they all expose the same interface.

For example we might have several IMM's each one with a unique methodology of calculation, scope, granularity, interface. To make each of these IMM's interoperable they each have to expose a software module which adheres to the IMI spec, this is called an IMP. Then to use an IMM all you need to do is to install the software module IMP for that IMM. All the software modules expose the same interface so you can swap them out easily.

### Impact Graph Node
**aka**: *graph node*, *node*
An [Impact Graph](spec/Impact%20Graph.md) is made up of nodes, each node represents either a [Grouping](#Grouping) or a [Component](#Component). 

### Component
**aka**: *component node*
A component is something that creates environmental impacts, for example a server, network traffic. If it creates and environmental impact it's called a component. They effectively form the leaf nodes of an [Impact Graph](spec/Impact%20Graph.md). Each component has an [Impact Model Plugin](spec/Impact%20Model%20Plugin.md) configured as well as some [input](input.md). We pass the inputs to the model plugin which interacts with a model to calculate the [Impact Metric](Impact%20Metric) for this component.
### Grouping
**aka**: *component grouping*, *grouping node*
This is a node in the graph used to group multiple components and/or other groupings together. It doesn't generates it's own impacts however it's child node impacts are aggregated up to itself. It's used to define useful structure to the graph for analysis.
### input
**aka**: *inputs*
An **input** is something you measure regarding a component in your subject at a particular time and for a particular duration. For example, an input about a server might be CPU utilization.
### Graph Duration
**aka**: ~
Every [Impact Graph](spec/Impact%20Graph.md) represents a duration of time for which inputs have been gathered about it's components. By default the graph duration will be the time from the earliest inputs to the latest input for all of it's components.
### Impact Duration
**aka**: ~
Every [Impact Metric](Impact%20Metric) is for a particular time and duration. The duration of an Impact Metric determines the granularity of the output timeseries. If the impact duration is equal to the graph duration then only one impact metric will be computed for the whole graph. If the impact duration is less than the graph duration then multiple impact metrics might be computed.
### input Duration
**aka**: ~
Every [input](input.md) is for a particular time and duration, this is called the input duration. There are usually multiple inputs provided as a time series, the input duration does not need to equal the impact duration which does not need to equal the graph duration.
### Computation
**aka**: ~
Is the act of calculating the impacts of an [Impact Graph](spec/Impact%20Graph.md).

### Computation Pipeline
**aka**: *computation pipeline*
Computing an [Impact Graph](spec/Impact%20Graph.md) involves several phases, calculation, enrichment, normalization and aggregation, they are configurable to allow the framework to be used in multiple contexts, e.g. SCI and GHG. The pipeline describes those phases.

### Computation Pipeline Plugin
**aka**: ~
Is an external package/module which is used to customize one or more phases in the [Computation Pipeline](Computation%20Pipeline.md).

