## Impl specification

The code snippet below defines a generic impl file, demonstrating the expected structure required by the IEF. This basic structure should generalize the any use case, and any model plugins should expect data to arrive in this format.

The `KEYWORD` tag is used to identify fields whose names should not be changed. Fields without the `KEYWORD` tag can have any name withoiut affecting the compatibility of the `impl` with a model plugin.

The `NO-SUBFIELDS`, `N-SUBFIELDS` or `ANY-SUBFILEDS` tags define whether there are restrictions on the subfields that should be present for each field in the spec. `NO-SUBFIELDS` means there should be no additional sub-nesting beneath a field. `N-SUBFIELDS` is used where there is a fixed number of subfields that shoudl be present (with `N` replaced by that number), and `ANY-SUBFIELDS` is useed for fields that can take any number of user-defined subfields without restriction.

```yaml
name:  # [KEYWORD] [NO-SUBFIELDS] project name
description: # [KEYWORD] [NO-SUBFIELDS] description or external link to project site/docs 
tags: # [KEYWORD] [ANY-SUBFIELDS] contains sub-fields with any relevant topic tags
config: # [KEYWORD] [ANY-SUBFIELDS] determines global config for generating energy calcs that apply to all nodes 
  global-data: # [KEYWORD] [ANY-SUBFIELDS] sub-fields containing any data that is common across the entire graph
  pipeline [KEYWORD] [4-SUBFIELDS]:
    calculation: # [KEYWORD] [NO-SUBFIELDS] which model to use to calculate energy/carbon
    normalization: # [KEYWORD] [NO-SUBFIELDS] which model to use to normalize over time
    aggregation: # [KEYWORD] [NO-SUBFIELDS] which model to use to aggregate data
    enrichment: # [KEYWORD] [NO-SUBFIELDS] which model to use for enrichment
graph: # [KEYWORD] [ANY-SUBFIELDS] graph is the set of components that make up the system under examination.
  component: # [2-SUBFIELDS] an example of a component - can take any name
    config: # [KEYWORD] [ANY-SUBFIELDS] elements under config are common to all children for this graph component
    children:  # [KEYWORD] [ANY-SUBFIELDS] the individual nodes inside this component
      child: # [1-SUBFIELDS] divider identifying a child node
        observations: # [KEYWORD] [2-SUBFIELDS] measurements for this node
          common: # [KEYWORD] [ANY-SUBFIELDS] these measurements are common across all timeseries elements for this child
          series: # [KEYWORD] [ANY-SUBFIELDS] in here are measurements at specific times - can be any number of these per child
            - timestamp: 2023-07-06T00:00 # [KEYWORD] [NO-SUBFIELDS] time when measurement occurred
              duration: 1 # [KEYWORD] [NO-SUBFIELDS] how many of the given time units does each observation represent?
          mapping: # [KEYWORD] [1-SUBFIELD] details for any unit conversions required
              units: #[KEYWORD] [NO-SUBFIELDS] time unit to normalize results to

# ... more children 
```

## Units

Each type of observation has a **default unit** and **default name**. For example, if you observe a CPU utilization, the name of the observation dimension is `CPU`, and the unit is as a `percentage`. The data passed in is expected to be in that format.

| Dimension     | Unit                |
| ------------- | ------------------- |
| CPU_used      | Percentage Utilized |
| mem_used      | Percentage Full     |
| mem_allocated | GB                  |
| Duration      | Seconds             |
| Timestamp     | ISO Time            |



## TDP coefficient

The TDP coefficient accounts for the non-linear relationhsip between CPU utilization and power. For example, the TDP of a CPU operating at 20% of the max capacity is not equal to `max TDP * 0.2`. Instead, there is a curve that describes the relationship. Four known points on this curve are:

| CPU Utilisation | TDP Coefficient |
| --------------- | --------------- |
| 0               | 0.12            |
| 10              | 0.32            |
| 50              | 0.75            |
| 100             | 1.02            |

This is a naive model to convert utilization to energy consumption proposed by Benjamin Davy in this article https://medium.com/teads-engineering/building-an-aws-ec2-carbon-emissions-dataset-3f0fd76c98ac. The TDP coeffcient for any utilization value can be calculated by interpolating these points.


## Power use efficiency (PUE)

PUE values are derived from this [source](https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/blob/e48c659f6dafc8b783e570053024f28b88aafc79/microsite/docs/Methodology.md#power-usage-effectiveness).

| Cloud provider | Power usage efficiency (PUE) |
| -------------- | ---------------------------- |
| AWS            | 1.135                        |
| GCP            | 1.1                          |
| Azure          | 1.185                        |





## Example

```yaml
name: dow-msft
description: "https://github.com/Green-Software-Foundation/sci-guide/blob/dev/use-case-submissions/dow-msft-Graph-DB.md"
tags:
  kind: db-api
  complexity: simple
  category: cloud
config:
  pipeline:
    calculation: dow-msft
    normalization: default
    aggregation: default
# Single observation
graph:
  backend: # an advanced grouping node
    model: default  
    config: 
      vendor: azure
      region: east-us  # lookup carbon intensity from region
    children: 
      tiger-database: # a leaf component
        observations: 
          common:
            n_cpu: 8
            ram: 32
            server: Intel-xeon-platinum-8380 # will lookup TPU and total embodied coefficients from model name
          series:
            - timestamp: 2023-07-06T00:00
              span: 1 # this data is using span, but the model expects duration
              tdp_coeff: 0.4 #% total available cpu usage as fraction in range 0-1
              cpu_utilization: 17.12
              memory_utilization: 6.2
          mapping:
            span:
              units: hours
              to: duration
      tiger-api: # a leaf component
        observations: 
          common:
            n_cpu: 1
            ram: 1.75 #total allocated
            server: Intel-xeon-platinum-8270 # will lookup TPU and total embodied coefficients from model name
          series:      
            - datetime: 2023-08-06T00:00
              duration: 1
              tdp_coeff: 0.4
              cpu_utilization: 25
              memory_utilization: 1.22 # 70% of memory allocation, as per docs
          mapping:
            span:
              units: hours
              to: duration
      neo4j-database: # a leaf component
        observations: 
          common:
            n_cpu: 8
            ram: 32 # total allocated in GB
            server: Intel-xeon-platinum-8380 # will lookup TPU and total embodied coefficients from model name
          series:
            - timestamp: 2023-07-06T00:00
              span: 1 # this data is using span, but the model expects duration
              tdp_coeff: 0.5 #% total available cpu usage as fraction in range 0-1
              cpu_utilization: 28.05
              memory_utilization: 6.3
          mapping:
            span:
              units: hours
              to: duration
      neo4j-api: # a leaf component
        observations: 
          common:
            n_cpu: 1
            ram: 1.75 #total allocated
            server: Intel-xeon-platinum-8270 # will lookup TPU and total embodied coefficients from model name
          series:      
            - datetime: 2023-08-06T00:00
              duration: 1
              tdp_coeff: 0.8
              cpu_utilization: 14
              memory_utilization: 1.13 # 65% of memory allocation, as per docs
          mapping:
            span:
              units: hours
              to: duration

```