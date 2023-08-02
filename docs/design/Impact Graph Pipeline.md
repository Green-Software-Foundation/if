
**Status**: Draft
**Author**: Asim Hussain (@jawache)
**Abstract**: How to process the outputs of an impact graph calculation, enriching it with grid emissions data, factoring in the functional unit, and time slicing to return a time series of SCI values.

## Introduction

The execution of a  graph involves several phases:

- **Calculation**: Calculating the impacts of every component (leaf) node.
- **Enrichment**: Enriching the impacts, for example, calculating the carbon from energy using grid emissions data.
- **Normalization**: Bucketing the impacts into an output time series based on a configured *globally defined* impact duration.
- **Aggregation**: Aggregating the inputs by each time bucket, up the impact graph, to the parent nodes, and finally, the root node 

## Calculation

We loop through the impact graph and component node by component node, pass in the provided observations to the configured model plugins, and capture the outputs as a series of Impact Metrics.

> [!note] 
> 
> If multiple observations have been provided, we provide **multiple** output impact metrics. A 1-1 mapping exists between an Observation and an output Impact Metric.


> [!important] 
> Each input observation is for a time and duration, and each output impact metric is for the same time and duration. We should link an Impact Metric to the exact observation used to generate it.

The output of the calculation phase (represented as pseudo-yaml) might look something like so:

```yaml
```

## Enrichment

This phase involves enriching the calculated impacts with any other data. The primary use case for this phase is to convert any energy values in the impacts to carbon values using grid emissions data.

### Grid Emissions
The enrichment phase enables us to consistently apply the same grid emissions source, granularity, and methodology (average vs. marginal), to all components.

This phase should instantiate a global grid emissions service. The service could return simply a global yearly average if grid emissions are not crucial in this graph. The service could be more advanced, using a vendor that produces granular data for grid emissions by time and region. The important thing is that we are using the **same grid emissions service and methodology for all impacts**.

> [!note] 
> For the enrichment with grid emissions to work, each impact metric needs to have 
> - time 
> - duration 
> - location 
> - energy
> 
> If all those parameters exist, then a grid emissions value can be sourced and applied to the energy to generate carbon (operational emissions as per the SCI spec)


## Normalization

The next phase is for each leaf node to normalize the output impact metrics to a time series defined by a global *impact duration*.

After normalization, we will lose the 1-1 mapping between input observations and output impact metrics, and the impact metrics will snap to a new time series defined by the impact duration.

>[!note]
> The output impact metric is effectively zero if no impact metric overlaps a given time and duration. It means nothing was running then, so there could not be any emissions from the component.

An impact metric might be of a longer or smaller duration than the new globally defined impact duration or overlaps the new impact duration in some way. There can be many algorithms to employ to bucket/slice up the values, but a good default strategy is to use a weighting of time. For example:

**TODO**

```
Table.
One impact metric covers the new duration. Just weight the values by the ratio of slice duration/duration.

Two impact metrics overlap the new duration. Weight the values according to the amount overlapping.

Etc...
```


## Aggregation

This phase aggregates the impact metrics from the component leaf nodes up the graph to the root node. The aggregation also applies to any parent nodes created for grouping purposes.

The aggregation snaps to the new global impact time series, so each time bucket is aggregated separately up the graph to the top.

In the end, each node in the graph has a time series of impacts that represent the aggregate impacts of itself and of its children.

So not only are we returning a time series for the root node, but also for any child nodes. Suppose you want to investigate why one time bucket has more impact than another. In that case, you can dig into its children and discover which of them is contributing most to the total impacts for that particular time bucket.

#### Functional Units (SCI)
This also is the phase where we consider the functional units and generate an actual SCI score (carbon per X) instead of just carbon.

> [!note] We could not do this earlier since normalization doesn't work once you've created an SCI score (a rate)

**Time**
When the functional unit (`R`) is a time, this is the easiest option. We need to scale up or down each carbon value (`c`) by the ratio of the functional unit and the impact duration.

For example, if the functional unit is *Hour* and the Impact Duration is 24 hrs. Then we divide carbon by 24 to get *Carbon per Hour*.

If the functional unit is *Hour* and the Impact Duration is 10 mins. Then we must multiply carbon by 6 to get *Carbon per Hour*.

**TODO** - Diagram to explain how the above works

**Other**
For any other functional unit, we need to know the value to scale the carbon by each impact time bucket. So if the impact duration is *10mins*, the graph duration is *60mins*, and the functional unit is *Users*. Then we need a value of *number of users* for **each** 10 min interval duration, which we use to divide the carbon figure by.

**TODO** - This REALLY needs a diagram or two to explain.

> [!tip] 
> 
> The same normalization plugin code could provide this time series of functional unit denominators. We pass in a fake component with observations that represent the functional unit denominators, pass through the normalization phase, and generate a series of users for the global time series of impact durations.

**TODO** - This REALLY needs a diagram to explain.

To handle the functional unit, we need to know the denominator of carbon. If it's *Users*, then for each output impact metric, we also need a value of *Users* to divide that carbon by to get Carbon per User.

Ultimately for the array of output Impact Metrics, we need an equal array of Functional Unit Denominators. That can be generated by us, normalized from another time series of data, or provided precisely as required by the end user.

**TODO** - This REALLY needs a diagram to explain.

