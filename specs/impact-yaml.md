# Impact Yaml (IMPL)

- Impact Yaml (or IMPL) is a file format based off [yaml](https://circleci.com/blog/what-is-yaml-a-beginner-s-guide/) that models an ontology you want to meaure.
- IMPL is the file format Impact Graphs can be saved to (and loaded from).
- IMPL being YAML means that it's more human readable and can be used as a **formal method of writing use cases**, such as SCI use cases.
- IMPL files can be named `.yaml` (or `.impl` in the future one IDEs like Visual Studio support .impl natively)

## Using IMPL

There are several use cases for an IMPL file.

### On the command line

- `impcon` can read IMPL files and calculate their impact metrics on the command line, useful for quick evaluations or for simple use cases. 
- `impcon` will:
  - Parse the impl content
  - Dynamically load the various IMPs described in the impl file
  - Call the IMPs passing in the associated telemetry which is defined in the impl
  - Capture the responses from the IMPs.
  - Sum up all the impact metrics up the graph to the root node.
  - Print the response back to the user.

### As a file format

- End user applications (including UI applications) will be able to save impact graphs as IMPL files and be able to load IMPL files to laod the impact graph into memory.

### To bootstrap code

- We should be able to write parsers which read an IMPL file and generate code that represents the Impact Graph.
- Humans can hand write some initial IMPL code to model a system, once the model becomes more complex and unweidly to handle as IMPL it can be generated into code and then the model further refined as code.

## Structure

```yaml
name: <name> # The name of the root node (the applicatio as a whole)
description: <description>
tags:
  <key>: <value>
components: # The nodes under this root node
  - <name>: # The name of this node
    model: # so we know which IMP to use to calculate this node
      path: <a unique string, path to represent an IMP>
    config: # common static params
      <key>: <value>
    observation: # A set of data points for a moment and duration of time.
      <key>: <value>
      ...
    observations: # Multiple sets of data points for multiples moments and durations of time.
      shared:
        <key>: <value> # Data that is repeated for every measurement, e.g machine type.
      series:
        - <first observation>
    observations: # Observations stored in a CSV file
      path: <file> # Path to a CSV file containing the measurements
    components: # The sub nodes of this node
      - <name>: <another component same as above>
```

## Example

A simple 3 component web server application running on GCP, Azure and AWS and using multiple IMMs and specifically calcualting an SCI score.

```yaml
name: My application
description: A simple web server
tags:
  kind: web-server
  complexity: simple
  category: cloud
components:
  - load balencer: 
      model: 
        path: org.boavizta.imp.vm.sci  
      config: 
        vendor: gcp
        region: west-us
      observation:
        2023-07-06T00:00:
        duration: 15s
        cpu: 0.34
      components: ~ 
  - backend server:
      model: 
        path: org.boavizta.imp.vm.sci  
      params: 
        vendor: azure
        region: east-us
      observations: 
        shared:
          sku: AC2
        series:
          - 2023-07-06T00:00:
            duration: 5s
            cpu: 0.34
          - 2023-07-06T00:05:
            duration: 5s
            cpu: 0.23
          - 2023-07-06T00:05:
            duration: 5s
            cpu: 0.11
      components: ~ 
  - caching layer:
      model: 
        path: com.intel.imp.vm.sci  
      params: 
        vendor: aws
        region: france
      observations: 
        shared:
          sku: EC2
        series:      
          - 2023-07-06T00:00:
            duration: 5s
            cpu: 0.34
          - 2023-07-06T00:05:
            duration: 5s
            cpu: 0.23
          - 2023-07-06T00:05:
            duration: 5s
            cpu: 0.11
      components: ~
```

Once it's run trhough `impcon` it might return/print out a yaml like so which contains the core aspects of an SCI score.

**NOTE**: We have not yet discussed in detail how to handle `I`, I believe it should be something configured seprately and we'll understand better once we start implentation.

**NOTE**: We have not yet discussed in detail how to handle `R`, same point as above.

```yaml
name: My application
e: 63 mWh # sum of all the child node energy 
m: 61g # sum of all the child node embodied
components:
  - load balencer: 
    e: 48 mWh
    m: 4g
  - backend server:
    e: 5 mWh
    m: 23g
  - caching layer:
    e: 10 mWh
    m: 34g
```

## GHG vs SCI

**If** we had used IMMs and IMPs that model the GHG protocol instead of the SCI protocol, like so:

```yaml
    model: 
      path: com.intel.imp.vm.-->ghg<--
      params:
        sku: EC2
```

Then the Impact Metrics returned would be in the form of Scope 1, 2 and 3 and the returned YAML might look like so:

```yaml
name: My application
scope1: 10.9g # sum of all the child node scope 1 
scope2: 95g # sum of all the child node scope 2
scope3: 162g # sum of all the child node scope 3
components:
  - load balencer: 
    scope1: 1.2g 
    scope2: 17g
    scope3: 56g
  - backend server:
    scope1: 2.3g 
    scope2: 28g
    scope3: 18g
  - caching layer:
    scope1: 7.4g 
    scope2: 33g
    scope3: 88g
```
