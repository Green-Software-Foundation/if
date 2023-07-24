# Cabon-QL SCI modeling for Kubernetes


This article is meant as work in progress discussion, to propose a carbon-QL modeling for kubernetes (that could be later implemented by different k8S providers)

## Carbon-QL YAML schema (wip)

```yaml
kind : <kind> #the kind or template of this component, default one is "GenericComponent"
name: <name> # The name of the root node (the applicatio as a whole)
metadata: 
  <key>: <value> #functional metadata about the modeled component
vars: # static vars that can be used, passed down to subcomponent
  <key>: <value>
model: # the model can be caculated locally or make a carbon-QL API remote call
  path: <model name or Carbon-QL API URL path>
  params :  # model params
    <key>: <value>
  telemetry : inline, or path, or queries (e.g Prometheus)
  subComponents: # used to compose an SCI from sub components
    <SubComponentKind>
        - name: <another component same as above>
          metadata : 
          params:
          path: 
          telemetry:          
  SCIAtrributedFrom: #used to attribute the SCI of the current component, based on the SCI of a hosting infra component (e.g shared resource)
    <AttributedComponentKind>
        - name: <another component same as above>
          metadata : 
          params:
          path: 
          telemetry:          
```


## Kubernetes components

The Cabon-QL API includes the following components:

Admin scenario:
- Node (smallest infra component, aka foundational component)
- Node Pool
- Cluster

Workload scenario:
- Pod (smalled workload component, aka foundation component)
- Deployment
- Job

## Kuberetnes components composition

Carbon-QL components composition patterns for K8s:

- **single foundational components (pod, node, disk,..)** : defines the base model to use, the params & telemetry, can set default vars

```yaml 

vars : <default vars>
model:
  path: azure.computte.aks.node.sci
  params : <model params>
  telemetry : <model telemetry>
```
 ---


- **calculating SCI from subscomponents** : use sub components to calculate their SCI core, and defines the model to compute the resulting SCI (addition subcomponents SCI in most cases)

```yaml 
model:
  path: gsf.common.AdditionSubComponentsSCIs:v1
  params : ~
  telemetry : ~
  subComponents:
    <SubComponentKind>
        - name: <another component same as above>
          metadata : 
          params:
          path: 
          telemetry: 
```

the current components, when calling subcomponents, can override 
          - metadata : 
          - params:
          - path: 
          - telemetry: 



----


- **calculating SCI based on a attribution % from another SCI** : to calculate SCI for workloads and shared environments, an SCI for a pod, would be attributed  (or calculated) from the SCI of the hosting node (based on % of node resources consumed by the pod for the defined time duration)

```yaml

model:
  path: azure.computte.aks.pod.sci
  params:
    <key>: <value>
telemetry:
  - <telemetry data>
SubComponents: ~
SCIAttributedFrom:
  - SCIComponentKind: k8sNode (or point to SCIComponentName directly mynode1)
    SCIComponentparams: 
      nodeName : <node name>

```



## Scenarios

## Example for Admin scenarios 

An admin wants to calculate the infrastructure SCI for an AKS cluster in Azure. They can use the following components:

- Node: my-node
- Node Pool: my-node-pool
- Cluster: my-cluster


```yaml
kind: k8sCluster
name : AKS-PROD-1
metadata: 
  attributes: compute
vars:
  vendor: azure
  region: eastus
  sku: standard
  rg : rg-prod-1
model:
  path: azure.aks.cluster.sci:v1
  params:
    clusterSKU: @vars.sku
    clusterName : @name
    clusterResourceGroup : @vars.rg
  telemetry : ~
  SubComponents:
      k8sNodePool:
        - name: mynode_pool-1
          metadata:
              app: batch
        - name: mynode_pool-2
          metadata:
              app: web

```

### Example for Developer scenario
A developer wants to calculate the workload SCI for a deployment and a job in an AKS cluster in Azure. 

They can use the following components:

- Pod: my-pod
- Deployment: my-deployment
- Job: my-job
- Namespace: my-namespace


```yaml
kind: GenericComponent
name : my-azure-workload
metadata: 
  attributes: compute
vars:
  vendor: azure
  region: eastus
  AKSClusterRG: rg-prod-1
  AKSClusterNanme: AKS-PROD-1
  workloadNamespace: AKS-PROD-1
model:
  path: gsf.common.AdditionSubComponentsSCIs:v1
  params : ~
  telemetry : ~
  subComponents:
    k8sDeployment:
        - name: my-deployment
          metadata:
            attributes: compute>
          params:
            deploymentNamespace : @vars.workloadNamespace
            clusterName: @vars.AKSClusterName
            cluster
            AKSClusterRG: @vars.AKSClusterRG    
    k8sJob:
        - name: my-job
          metadata:
            attributes: compute
    RedisCache:
        - name: my-cache
            metadata:
              attributes: compute
            model:
                path: azure.compute.redis.sci:v #overriding the original model for redis cache sci component
```



### Node

The Node component represents a single virtual machine (VM) in the infrastructure. The Node component includes the following keys:

```yaml
kind: k8sNode
name : <node name>
metadata: 
  attributes: compute
vars:
  vendor: <vendor>
  region: <region>
  cluster : <cluster name>
  zone: <zones>
  sku: <sku>
model:
  path: <vendor>.<model>.<compute>.<sku>
  params:
      zone: @vars.zone
      region: @vars.region
      sku: @vars.sku
  telemetry:
    - <telemetry data>
  SubComponents: ~

```

### Node Pool

The Node Pool component represents a set of Nodes belonging to the same scale-set and sharing the same SKU. The Node Pool component includes the following keys:

```yaml
kind: k8sNodePool
name : <node pool name>
metadata: 
  attributes: compute
vars:
  vendor: <vendor>
  region: <region>
  sku: <sku>
  cluster : <cluster name>
model:
  path: <vendor>.<model>.<compute>.<sku>
  params: ~
  telemetry: ~
  SubComponents:
    k8sNode:
      - name: <node1>
      - name: <node2>
```

### Cluster

The Cluster component represents the infrastructure, such as an AKS or Kubernetes cluster. The Cluster component includes the following keys:

```yaml
kind: k8sCluster
name : <cluster name>
metadata: 
  attributes: compute
params:
  vendor: <vendor>
  region: <region>
  clusterSku: <sku>
model:
  path: <vendor>.<model>.<compute>.<sku>
  params: ~
  telemetry: ~
SubComponents:
  k8sNodePool:
    - name: <mynode_pool-1>
      params:
        <key>: <value>
      metadata:
        <key>: <value>
    - name: <mynode_pool-2>
      params:
        <key>: <value>
      metadata:
        <key>: <value>
```

### Pod
The Pod component represents a set of containers running on a Node. The Pod component includes the following keys:

```yaml
kind: k8sPod
name : <pod name>
metadata: 
  attributes: compute
vars:
  image: <image>
  node: <node name>
  cluster: <cluster name>
model:
  path: <vendor>.<model>.<compute>.<sku>
  params:
    <key>: <value>
telemetry:
  - <telemetry data>
SubComponents: ~
SCIAttributedFrom:
  - SCIComponentKind: Node (or point to SCIComponentName directly mynode1)
    SCIComponentparams: 
      nodeName : <node name>
```

### Deployment

The Deployment component represents several containers that might be running on different Nodes at different times. The Deployment component includes the following keys:

```yaml
kind: k8sDeployment
name : <deployment name>
metadata: 
  namespace: <deployment ns>
vars:
  image: <image>
  namespace: <namespace>
model:
  path: <vendor>.<model>.<compute>.<sku>
  params: ~
  telemetry: ~
SubComponents:
  k8sPod:
    - name: <pod1>
    - name: <pod2>
```



### Job

The Job component represents a single task that runs to completion. The Job component includes the following keys:

```yaml
kind: k8sJob
name : <job name>
metadata: 
  namespace: <job ns>
  cluster: <cluster name>
vars:
  image: <image>
  namespace: <namespace>
model:
  path: <vendor>.<model>.<compute>.<sku>
  params: ~
  telemetry: ~
SubComponents:
  k8sPod:
    - name: <pod1>
```


