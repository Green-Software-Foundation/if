---
author: Asim Hussain (@jawache)
abstract: Why granularity is important to impact graphing and the two main types of granularity you can add.
---
# Granularity

An [Impact Graph](Impact%20Graph.md) (graph) can be created that is very coarse-grained, a single top-level component, with a single input of long duration.

```yaml
name: My application
graph:
  all-my-servers:
  ...
```

This graph is legal, it can calculate an impact metric, and it *might* be helpful as a starting point.

But as you add more granularity to your graph, you generate a more accurate impact metric and surface more interesting information, such as **where** and **when** the outputs are being generated.

A top-level course-grained impact metric doesn't tell you which components are generating most of your emissions or when they are generating your emissions. To get more information about where to invest in reducing your application's impact, you need to get granular, both in terms of structural granularity and temporal granularity. 
### Structural Granularity

When you compute a graph, each component gets a separate Impact Metric, and the root Impact Metric is the sum of all the component Impact Metrics.

```yaml
name: My application
graph: # sum = 52 
  load-balancer: 1
  web-server: 15
  caching-layer: 3
  application-servers: 23
  api-servers: 2
  batch-servers: 3
  email-servers: 5
```

However, an impact graph contains grouping and component (leaf) nodes. Only components can generate outputs and can be measured. Grouping nodes are simply the sum of the outputs of their child nodes. Grouping nodes allow you to aggregate related components together for helpful analysis. Measure several components individually and see their aggregate impact in a grouping.

```yaml
name: My application
graph: # sum = 52
  scalable: # sum = 44
    3rd-party: # sum = 16
	  load-balancer: 1
	  web-server: 15
    in-house: # sum = 28
	  caching-layer: 3
	  application-servers: 23 
	  api-servers: 2
  fixed: # sum = 8
    batch-servers: 3
    email-servers: 5
```

> Structural granularity is all about increasing the number of nodes in your graph; more nodes mean more outputs are being calculated, and this information can surface insights.

### Temporal Granularity

A graph can calculate a single Impact Metric for its whole duration (graph duration) or create a time series of Impact Metrics for smaller durations (impact durations).

The engine will handle normalizing, bucketing, and slicing time to generate any output time series from any sets of input inputs. The input inputs don't need to be in the same frequency or interval as the output time series. They don't need to be synchronized with the other components or output outputs.

However, the more granular inputs you can provide, the more accurate the output impact metric time series will be. More inputs of shorter duration drive temporal granularity.

```yaml
name: My application
graph: # sum = 52,51,...
  scalable: # sum = 44,43,...
    3rd-party: # sum = 16,20,...
	  loal-balancer: 1,2,...
	  web-server: 15,18,...
    in-house: # sum = 28,23,...
	  caching-layer: 3,1,...
	  application-servers: 23,19,...
	  api-servers: 2,3,...
  fixed: # sum = 8,8,...
    batch-servers: 3,3,...
    email-servers: 5,5,...
```

> Adding temporal granularity surfaces information regarding when your components generate the most impact. This is achieved by adding in more inputs of shorter durations. Instead of one input per hour, can you provide one per minute?

