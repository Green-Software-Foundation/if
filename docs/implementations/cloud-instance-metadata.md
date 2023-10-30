# Cloud Instance Metadata

This plugin allows you to determine an instance's CPU based on its instance name.

## IEF Implementation

IEF implements this plugin using data from Cloud Carbon Footprint. This allows determination of cpu for type of instance in a cloud and can be invoked as part of a model pipeline defined in an `impl`.

Cloud Instance Metadata currently implements only for 'AWS'.

## Usage

In IEF, the model is called from an `impl`. An `impl` is a `.yaml` file that contains configuration metadata and usage inputs. This is interpreted by the command line tool, `impact`. There, the model's `configure` method is called first. The model config shall be empty. Each input is expected to contain `cloud-vendor` and `cloud-instance-type` fields.

You can see example Typescript invocations for each vendor below:

### AWS

```typescript
import {CloudInstanceMetadataModel} from 'ief';

const cimm = new CloudInstanceMetadataModel();
const results = cimm.calculate([
  {
    'cloud-vendor': 'aws',
    'cloud-instance-type': 'm5n.large'
  }
])
```

## Example Impl

The following is an example of how cloud instance metadata can be invoked using an `impl`.

```yaml
name: cloud-instance-metadata-demo
description: example impl invoking Cloud Instance Metadata model
initialize:
  models:
    - name: cloud-instance-metadata
      kind: builtin
graph:
  children:
    child:
      pipeline:
        - cloud-instance-metadata
      config:
      inputs:
        - timestamp: 2023-07-06T00:00 # [KEYWORD] [NO-SUBFIELDS] time when measurement occurred
          vendor: aws
          instance_type: m5n.large
          duration: 100
          cpu-util: 10
```

This impl is run using `impact` using the following command, run from the project root:

```sh
npx ts-node scripts/impact.ts --impl ./examples/impls/cimd-test.yml --ompl ./examples/ompls/cimd-test.yml
```

This yields a result that looks like the following (saved to `/ompls/cimd-test.yml`):

```yaml
name: cloud-instance-metadata-demo
description: example impl invoking Cloud Instance Metadata model
initialize:
  models:
    - name: cloud-instance-metadata
      kind: builtin
graph:
  children:
    front-end:
      pipeline:
        - cloud-instance-metadata
      inputs:
        - timestamp: 2023-07-06T00:00
          cloud-vendor: aws
          cloud-instance-type: m5n.large
          duration: 100
          cpu: 10
      outputs:
        - timestamp: 2023-07-06T00:00
          cloud-vendor: aws
          cloud-instance-type: m5n.large
          physical-processor: Intel Xeon Platinum 8259CL
          duration: 100
          cpu: 10
```
