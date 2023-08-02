**Status**: Draft
**Author**: Asim Hussain (@jawache)
**Abstract**: Describes the structure and purpose of Impact YAML, a file format to represent an Impact Graph.

# Introduction 

- Impact YAML (IMPL) is a file format based on [yaml](https://circleci.com/blog/what-is-yaml-a-beginner-s-guide/)  to represent an [Impact Graph](design/Impact%20Graph.md). 
- Just like an Impact Graph, an IMPL is a calculation manifest containing everything you want to measure and how you want to measure it. 
- IMPL being YAML means it's more human-readable and can be used as a **formal method of writing use cases**, such as SCI use cases.
- IMPL files can be named `.yaml` (or `.impl`).
- IMPLs can be computed on the command line using the [Rimpl](Rimpl.md) tool, printing out the results to file or STDOUT.
- You can do much more using the [Impact Graph](design/Impact%20Graph.md) SDK directly; however, for many use cases, IMPL works fine.

## Use Cases

There are several use cases for an IMPL file.

### A formal report

An IMPL is a computable calculation manifest. A formal report detailing not just the end impact but all the assumptions, inputs, and models used in calculating the impact.

Being a very formal structure, it can be parsed by software, compared to other reports, adjusted, run, and verified.

Currently, in the GSF several case studies have been written to calculate an SCI score for an application, these can all be re-written in IMPL format.

### An executable impact calculation manifest

The command line tool [Rimpl](Rimpl.md) can compute an IMPL file and generate impact metrics. 

### To bootstrap code

- IMPLs will be able to represent simple calculation manifest but to handle larger, more complex systems, we will have to write Impact Graphs as code using our SDK.
- To help bootstrap the process, humans can write the high-level structure using IMPL and run through a tool to generate starter Impact Graph code in any language our SDK supports.

## Structure

```yaml
name: <name>
description: <description>
tags:
  <key>: <value>
variables:
  <key>: <value>
config:
  pipeline:
    calculation: TBD
    normalization: TBD
    bucketing: TBD
    aggregation: TBD
graph: # The nodes under this root node

  # Single observation
  <component>:
    model: <imp-identifier>
    config: 
      <key>: <value>
    observation:
      timestamp: <timestamp>
      duration: <duration>
      <key>: <value>

  # Multiple observations      
  <component>:
    model: <imp-identifier>
    config: 
      <key>: <value>
    observations:
      common:
        <key>: <value>
      series:
        - timestamp: <timestamp>
          duration: <duration>
          <key>: <value>
        - timestamp: <timestamp>
          duration: <duration>
          <key>: <value>        
      mapping:
        <from-field>:
          to: <to-field>
          units: <units>

  # Multiple observations from CSV 
  <component>:
    model: <imp-identifier>
    config: 
      <key>: <value>
    observations:
      common:
        <key>: <value>
      series:
        csv: <path-to-csv>       
      mapping:
        <from-field>:
          to: <to-field>
          units: <units> 

  # Simple grouping
  <grouping>:
    <component>:
      model: <imp-identifier>
      config: 
        <key>: <value>
      observation:
        timestamp: <timestamp>
        duration: <duration>
        <key>: <value>

  # Advanced grouping
  <grouping>:
    model: <imp-identifier>
    config: 
      <key>: <value>
    children:
      <component-1>:
        observation:
          timestamp: <timestamp>
          duration: <duration>
          <key>: <value>
      <component-2>:
        observation:
          timestamp: <timestamp>
          duration: <duration>
          <key>: <value>
```


## Example

A simple 3 component web server application running on GCP, Azure, and AWS and using multiple IMMs and specifically calculating an SCI score.

```yaml
name: My application
description: A simple web server
tags:
  kind: web-server
  complexity: simple
  category: cloud
config: 
  pipeline: # config to define computation settings to support an SCI calculation
    calculation: 
      plugin: gsf.pipeline.calc.sci
    enrichment:
      plugin: gsf.pipeline.enrich.sci
      grid-emissions-plugin: watttime
    normalization:
      plugin: gsf.pipeline.norm.sci
      impact-window: 3600
    aggregation:
      plugin: gsf.pipeline.agg.sci
      functional-unit: hour
graph:
  backend: # an advanced grouping node
    model: boavizta.cloud.sci  
    config: 
      vendor: azure
      region: east-us  
    children: 
      queue: # a leaf component
        observations: 
          common:
            sku: AC2
          series:
            - timestamp: 2023-07-06T00:00
              span: 5 # this data is using span, but the model expects duration
              cpu: 0.34
            - timestamp: 2023-07-06T00:05
              span: 5
              cpu: 0.23
            - timestamp: 2023-07-06T00:05
              span: 5
              cpu: 0.11
          mapping:
            span:
              units: seconds
              to: duration
      servers: # a leaf component
        config: ccf.cloud.sci  
        params: 
          vendor: aws
          region: france
        observations: 
          common:
            sku: EC2
          series:      
            - datetime: 2023-07-06T00:00
              duration: 5
              cpu: 0.34
            - datetime: 2023-07-06T00:05
              duration: 5
              cpu: 0.23
            - datetime: 2023-07-06T00:05
              duration: 5
              cpu: 0.11
  edge: # a simple grouping node
    load-balancer: 
      model: boavizta.cloud.sci
      config: 
        vendor: gcp
        region: west-us
      observation: # a single observation for the whole duration
        datetime: 2023-07-06T00:00
        duration: 15
        cpu: 0.34
```

Once it's computed through an application like [Rimpl](Rimpl.md), it might return/print out a YAML like so:

```yaml
name: My application
graph:
  impacts:
    e: 63 mWh # sum of all the child node energy 
    m: 61g # sum of all the child node embodied
  children:
    edge:
      impacts: 
        e: 48 mWh
        m: 4g
      children:
        load-balancer:
          impacts:
            e: 48 mWh
            m: 4g
  backend:
    impacts:
      e: 15 mWh
      m: 57g  q3
    children:
      backend server:
        impacts:
          e: 5 mWh
          m: 23g
      caching layer:
        impacts:    
          e: 10 mWh
          m: 34g
```
