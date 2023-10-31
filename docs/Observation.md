---
author: Asim Hussain (@jawache)
abstract: Describes an input in the context of an Impact Graph.
---

# input

inputs are a core component of an [Impact Graph](Impact%20Graph.md) (graph), and they form the primary input into an [Impact Model Plugin](Impact%20Model%20Plugin.md) (model).

An **input** is something you measure regarding a component in your software system. For example, an input about a server might be CPU utilization. inputs are passed into models which generate impact metrics.

Different models require different kinds of inputs. If a model converts billing data to carbon emissions, the inputs must include billing information. inputs can be varied, billing data, utilization, number of users over time, responses from a survey, they can be anything at all.

- All inputs have a **timestamp** and **duration**.
- inputs can be n-dimensional; each time and duration can have multiple values, e.g., CPU and Mem utilization.
- inputs are always a time series. Even if you only pass in one input with a long duration, it's still a time series with one entry.

In [Impl (Impact YAML)](Impl%20(Impact%20YAML).md), inputs are expressed like so:

```yaml
  series:      
	- timestamp: 2023-07-06T00:00
	  duration: 5
	  cpu: 0.34
	- timestamp: 2023-07-06T00:05
	  duration: 5
	  cpu: 0.23
	- timestamp: 2023-07-06T00:05
	  duration: 5
	  cpu: 0.11
```

But they can also be stored in CSV files like so:

| Timestamp           | Duration | CPU | Mem | Disk |
| ------------------- | -------- | --- | --- | ---- |
| 2023-07-26T13:00:00 | 15       | 23  | 87  | 2    |
| 2023-07-26T13:00:15 | 15       | 26  | 86  | 4    |
| 2023-07-26T13:00:30 | 15       | 46  | 76  | 6    |
| 2023-07-26T13:00:45 | 15       | 2   | 60  | 10   |
| 2023-07-26T13:01:00 | 15       | 4   | 55  | 1    |

#### Default Units and Names

Each type of input has a **default unit** and **default name**. For example, if you observe a CPU utilization, the name of the input dimension is `cpu`, and the unit is as a `percentage`. Aggregation method is `avg`. The data passed in is expected to be in that format.


| Dimension | Unit                      |
| --------- | ------------------------- |
| CPU       | Percentage Utilized       |
| MEM       | Percentage Full           |
| Disk      | Total Read/Writes         |
| Duration  | Seconds                   |
| Timestamp | ISO8601/RFC3339 Timestamp |



## input synchronization

Each component in your graph needs inputs; we need inputs to compute outputs.

A helpful feature of the engine is that you don't need to synchronize all your input inputs for all your components with each other. You can provide inputs at different intervals for every component in the graph. 

![](images/72efce519e8c2264406864148a8a3151.png)
%%[🖋 Edit in Excalidraw](inputs%20-%20Synchronization.excalidraw.md), and the [dark exported image](inputs%20-%20Synchronization.excalidraw.dark.png)%%

In the [](Computation%20Pipeline.md#Normalization|Normalization) phase of the computation of a graph, we do synchronize the output Impact Metrices, but we don't need the input inputs synchronized to do this.

### How does an input differ from Telemetry?

Telemetry is the automatic recording and transmission of very fine-grain data about a software system from remote sources. You can gather an input from anything, **including human judgment**, assumptions, other models, survey data, and spreadsheets. inputs tend to be at a higher grain, with durations more likely in the range of 5 mins to an hour. inputs and telemetry work hand in hand; inputs will usually be collected by querying a system that has collected Telemetry to create a time series, for example, Prometheus.

### inputs drive temporal granularity

As discussed in the [Granularity](Granularity.md) design document, an essential feature of the [Impact Engine Framework](Impact%20Engine%20Framework.md) is to provide a granular analysis of the impacts of a software system.

One dimension of granularity is time, and inputs are how we provide that temporal granularity.

You can provide one single input for a long duration for every component in an [Impact Graph](Impact%20Graph.md); however, this won't give you a view of how the impacts changed over time. 

This is why inputs are a time series; the more inputs you can provide about components over time, the more the engine can surface impacts over time.

Another reason to provide multiple inputs is to gain a much more accurate emissions estimate. Many of the models used to translate inputs into outputs are non-linear. This means just providing an average value over time will give you a less accurate value than providing more data points over time.
