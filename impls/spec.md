## Impl specification

The code snippet below defines a generic impl file, demonstrating the expected structure required by the IEF. This basic structure should generalize the any use case, and any model plugins should expect data to arrive in this format.

```yaml
name: #project name
description: # description or external link to project site/docs
tags: #anything provided here will simpy, be copied into the Graph object as a dict (i..e graph.tags == {kind: db-api, complexity: simple ...})
  kind: db-api
  complexity: simple
  category: cloud
config: # determines global config for generating energy calcs that apply to all nodes 
  global-data: #any data that is common across the entire graph
    element: <data> # one element per piece of global data - can be none
  pipeline:
    calculation: # which model to use to calculate energy/carbon
    normalization: # which model to use to normalize over time
    aggregation: # which model to use to aggregate data
    enrichment: # which model to use for enrichment
graph: # graph is the set of components that make up the system under examination. The final energy estimates sum all components in the graph.
  backend: # an example of a component - the name is not a keyword - you can use any name here
    config: # elements under config are common to all children for this graph component
      vendor: azure # example config element
      region: east-us  # example config element
    children:  # the individual nodes inside this component (e.g. the backend component might comprise database and api children)
      tiger-database: # name of this child node
        observations: # measurements for this node
          common: # these measurements are common across all timeseries elements for this child
            n_cpu: 8 # number of CPU cores available
            ram: 32 # total allocated RAM ( can probably remove this and replace with a lookup in the model)
            server: Intel-xeon-platinum-8380 # CPU chip name - used to lookup data such as TPU and total embodied coefficients
          series: # in here are measurements at specific times - can be any number of these per child
            - timestamp: 2023-07-06T00:00 # time when measurement occurred
              span: 1 # how many of the given time units does each observation represent?
              tdp_coeff: 0.4 # maybe this can be derived in-model from e.g. cpu_utilization?
              cpu_utilization: 17.12 # CPU utilized at a specific timepoint
              memory_utilization: 6.2 # memory utilized at a specific timepoint
          mapping: # details for any unit conversions required
            span: # maps span of time to real time units
              units: hours
              to: duration

# ... more children 
```