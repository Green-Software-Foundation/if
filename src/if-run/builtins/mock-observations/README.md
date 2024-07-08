# Mock Observations Plugin

## Introduction

A plugin for mocking observations (inputs) for testing and demo purposes

## Scope

The mode currently mocks 2 types of observation data:

- Common key-value pairs, that are generated statically and are the same for each generated observation/input (see 'helpers/CommonGenerator.ts')
- Randomly generated integer values for predefined keys (see 'helpers/RandIntGenerator.ts')

### Plugin global config

- `timestamp-from`, `timestamp-to` and `duration` define time buckets for which to generate observations.
- `generators` define which fields to generate for each observation
- `components` define the components for which to generate observations. The observations generated according to `timestamp-from`, `timestamp-to`, `duration` and `generators` will be duplicated for each component.

### Authentication

N/A

### Inputs

The plugin's `global-config` section in the manifest file determines its behaviour.
'inputs' section is ignored.

### Typescript Usage

```typescript
const mockObservations = MockObservations({
  'timestamp-from': '2023-07-06T00:00',
  'timestamp-to': '2023-07-06T00:10',
  duration: 60,
  components: {
    'instance-type': 'A1',
  },
  generators: {
    common: {
      region: 'uk-west',
    },
  },
});
const result = await mockObservations.execute([]);
```

### manifest Example

IF users will typically call the plugin as part of a pipeline defined in a `manifest` file. In this case, instantiating the plugin is handled by `ie` and does not have to be done explicitly by the user. The following is an example `manifest` that calls `mock-observation`:

```yaml
name: mock-observation-demo
description: example invoking mock-observation plugin
tags:
initialize:
  outputs:
    - yaml
  plugins:
    mock-observations:
      kind: plugin
      method: MockObservations
      path: 'builtin'
      global-config:
        timestamp-from: 2023-07-06T00:00
        timestamp-to: 2023-07-06T00:10
        duration: 60
        components:
          - instance-type: A1
          - instance-type: B1
        generators:
          common:
            region: uk-west
            common-key: common-val
          randint:
            cpu/utilization:
              min: 1
              max: 99
            memory/utilization:
              min: 1
              max: 99
tree:
  children:
    child:
      pipeline:
        - mock-observations
      inputs:
```

You can run this example `manifest` by saving it as `manifests/plugins/mock-observation.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
if-run --manifest ./examples/manifests/test/mock-observation.yml --output ./examples/outputs/mock-observation
```

The results will be saved to a new `yaml` file in `./examples/outputs`.
