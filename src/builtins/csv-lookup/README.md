# CSV Lookup Plugin

`csv-lookup` is a generic plugin which enables a user to grab arbitrary data from a given csv file and add it to `input` array.

You provide path to a csv file (can ba either local file or url), the columns to grab data from (an array of key/value pairs where the key is a column name in the target csv and the value is a parameter from inputs) and output data.

## Parameters

### Plugin config

- `filepath` - path to a csv file, either on the local filesystem or on the internet
- `query` - an array of key/value pairs where the key is a column name in the target csv and the value is a parameter from inputs
- `output` - the columns to grab data from and add to output data - should support wildcard or multiple values. Here are few samples for supported values: `"*"`, `"tdp"`, `["processor-name": "processor-model-id"]`, `[["processor-name", "processor-model-id"],["tdp","thermal-design-power"]]`

### Inputs

There are not strict requirements on input for this plugin. However make sure that `query` parameters should be present in input.

## Returns

The input data and additional csv content.

## Plugin logic

1. Validates global config which contains `filepath`, `query` and `output`.
2. Tries to retrieve given file (with url or local path).
3. Parses given CSV.
4. Filters requested information from CSV.

## Implementation

To run the plugin, you must first create an instance of `CSVLookup`. Then, you can call `execute()`.

```typescript
const globalConfig = {
  filepath: 'https://raw.githubusercontent.com/Green-Software-Foundation/if-data/main/cloud-metdata-aws-instances.csv',
  query: {
    'cloud-provider': 'cloud/provider'
	  region: 'cloud/region'
	  'instance-type': 'cloud/instance-type'
  },
  output: ['cpu-tdp', 'tdp'],
};
const divide = CSVLookup(globalConfig);

const input = [
  {
    timestamp: '2023-08-06T00:00'
    duration: 3600
    'cpu/energy': 0.001
    'cloud/provider': gcp
    'cloud/region': asia-east
  },
];
```

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in a manifest file. In this case, instantiating the plugin is handled by `if` and does not have to be done explicitly by the user. The following is an example manifest that calls `csv-lookup`:

```yaml
name: csv-lookup-demo
description:
tags:
initialize:
  outputs:
    - yaml
  plugins:
    cloud-metadata:
      method: CSVLookup
      path: 'builtin'
      global-config:
        filepath: https://raw.githubusercontent.com/Green-Software-Foundation/if-data/main/region-metadata.csv
        query:
          cloud-provider: "cloud/provider"
          cloud-region: "cloud/region"
        output: "*"
tree:
  children:
    child:
      pipeline:
        - cloud-metadata
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          cloud/provider: Google Cloud
          cloud/region: europe-north1
```

You can run this example by saving it as `./examples/manifests/csv-lookup.yml` and executing the following command from the project root:

```sh
npm i -g @grnsft/if
ie --manifest ./examples/manifests/csv-lookup.yml --output ./examples/outputs/csv-lookup.yml
```

The results will be saved to a new `yaml` file in `./examples/outputs`.
