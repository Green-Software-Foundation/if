# CSV Lookup Plugin

`csv-lookup` is a generic plugin that enables you to select arbitrary data from a given csv file and add it to your manifest file's `input` data.

You provide path to the target csv file pus some query parameters. The filepath can point to a location on the local filesystem or it can be a URL for an online resource. The query parameters include the column names for the target data you want to return (can be one column name, multiple column names or all column names, indicated using `"*"`), plus the column names and values you want to use as selectors.

For example, for the following CSV:

|      |                |                 |            |            |              |           |                  |            |            |                        |            |                            |                                   |                                |                                  |                       |
| ---- | -------------- | --------------- | ---------- | ---------- | ------------ | --------- | ---------------- | ---------- | ---------- | ---------------------- | ---------- | -------------------------- | --------------------------------- | ------------------------------ | -------------------------------- | --------------------- |
| year | cloud-provider | cloud-region    | cfe-region | em-zone-id | wt-region-id | location  | geolocation      | cfe-hourly | cfe-annual | power-usage-efficiency | net-carbon | grid-carbon-intensity-24x7 | grid-carbon-intensity-consumption | grid-carbon-intensity-marginal | grid-carbon-intensity-production | grid-carbon-intensity |
| 2022 | Google Cloud   | asia-east1      | Taiwan     | TW         | TW           | Taiwan    | 25.0375,121.5625 | 0.18       |            |                        | 0          | 453                        |                                   |                                |                                  | 453                   |
| 2022 | Google Cloud   | asia-east2      | Hong Kong  | HK         | HK           | Hong Kong | 22.3,114.2       | 0.28       |            |                        | 0          | 453                        |                                   |                                |                                  | 360                   |
| 2022 | Google Cloud   | asia-northeast1 | Tokyo      | JP-TK      | JP-TK        | Tokyo     | 35.6897,139.692  | 0.28       |            |                        | 0          | 463                        |                                   |                                |                                  | 463                   |


You could select all the data for the cloud provider `Google Cloud` in the region `asia-east2` using the following configuration:

```yaml
filepath: https://raw.githubusercontent.com/Green-Software-Foundation/if-data/main/region-metadata.csv
query:
  cloud-provider: "cloud/provider"
  cloud-region: "cloud/region"
output: "*"
```

Notice that the query parameters are key/value pairs where the key is the column name in the target CSV and the value is a **reference to a value** in your `input` data (*not* an actual value - a reference). This is to enable you to chain CSV lookups together based on information from other plugins in your pipeline.


## Parameters

### Plugin config

- `filepath` - path to a csv file, either on the local filesystem or on the internet
- `query` - an array of key/value pairs where the key is a column name in the target csv and the value is a parameter from inputs
- `output` - the columns to grab data from and add to output data - should support wildcard or multiple values. 

The plugin also supports data renaming. This means you can grab data from a named column but push it into your manifest file data under another name, for example, maybe we want to grab data from the `processor-name` column int he target csv and add it to the manifest file data as `processor-id` because this is the name expected by some other plugin in your piepline. You can do this by passing comma separated values in arrays. 

```yaml
output:
  ["processor-name": "processor-id"]
```

You can nest arrays to do this renaming for multiple columns.

```yaml
output:
  [["processor-name", "processor-model-id"],["tdp","thermal-design-power"]]
```

All the following values are valid for the `output` field:
- `"*"`
- `"tdp"`
- `["processor-name", "processor-model-id"]`
- `[["processor-name", "processor-model-id"],["tdp","thermal-design-power"]]`

### Inputs

There are no strict requirements on input for this plugin because they depend upon the contents of the target CSV and your input data at the time the CSV lookup is invoked. Please make sure you are requesting data from columns that exist in the target csv file and that your query values are available in your `input` data.

## Returns

The input data with the requested csv content appended to it.

## Plugin logic

1. Validates global config which contains `filepath`, `query` and `output`.
2. Tries to retrieve given file (with url or local path).
3. Parses given CSV.
4. Filters requested information from CSV.
5. Adds new key-value pairs to the input data
6. Returns enriched input data

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
if-run --manifest manifests/plugins/csv-lookup.yml --output manifests/outputs/csv-lookup
```

The results will be saved to a new `yaml` file in `manifests/outputs`.
