# SCI (software carbon intensity)

[SCI](https://sci-guide.greensoftware.foundation/) represents the amount of carbon emitted per [functional unit](https://sci-guide.greensoftware.foundation/R/).

## Parameters

### Plugin global config

- `functional-unit`: the name of the functional unit in which to express the carbon impact (required)


### Inputs


- `carbon`: total carbon in gCO2eq (required)
- `functional-unit`: whatever `functional-unit` you define in global config also has to be present in each input, for example if you provide `functional-unit: requests` in global config, `requests` must be present in your input data.

## Returns

- `sci`: carbon expressed in terms of the given functional unit

## Calculation

SCI is calculated as:

```pseudocode
sci = carbon / functional unit
```


## IF Implementation

To run the plugin, you must first create an instance of `Sci`. Then, you can call `execute()` to return `sci`.

```typescript
import {Sci} from 'builtins';

const sci = Sci({'functional-unit': 'requests'});
const results = await sci.execute(
  [
    {
      'carbon': 5'
      duration: 1,
      requests: 100,
    },
  ]
);
```

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in a `manifest` file. In this case, instantiating the plugin is handled by `ie` and does not have to be done explicitly by the user.

The following is an example `manifest` that calls `sci`:

```yaml
name: sci-demo
description: example invoking sci plugin
tags:
initialize:
  outputs:
    - yaml
  plugins:
    sci:
      method: Sci
      path: 'builtin'
      global-config:
        functional-unit: 'requests'
tree:
  children:
    child:
      pipeline:
        - sci
      config:
      inputs:
        - timestamp: 2023-07-06T00:00
          carbon: 5
          duration: 1
          requests: 100
```

You can run this example `manifest` by saving it as `./manifests/plugins/sci.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
ie --manifest manifests/plugins/sci.yml --output manifests/outputs/sci.yml
```

The results will be saved to a new `yaml` file.
