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
  cloud-provider: 'cloud/provider'
  cloud-region: 'cloud/region'
output: '*'
```

Notice that the query parameters are key/value pairs where the key is the column name in the target CSV and the value is a **reference to a value** in your `input` data (_not_ an actual value - a reference). This is to enable you to chain CSV lookups together based on information from other plugins in your pipeline.

## Parameters

### Plugin config

- `filepath` - path to a csv file, either on the local filesystem or on the internet
- `query` - an array of key/value pairs where the key is a column name in the target csv and the value is a parameter from inputs
- `output` - the columns to grab data from and add to output data - should support wildcard or multiple values.

The plugin also supports data renaming. This means you can grab data from a named column but push it into your manifest file data under another name, for example, maybe we want to grab data from the `processor-name` column int he target csv and add it to the manifest file data as `processor-id` because this is the name expected by some other plugin in your piepline. You can do this by passing comma separated values in arrays.

```yaml
output: ['processor-name': 'processor-id']
```

You can nest arrays to do this renaming for multiple columns.

```yaml
output:
  [['processor-name', 'processor-model-id'], ['tdp', 'thermal-design-power']]
```

All the following values are valid for the `output` field:

- `"*"`
- `"tdp"`
- `["processor-name", "processor-model-id"]`
- `[["processor-name", "processor-model-id"],["tdp","thermal-design-power"]]`

### Plugin parameter metadata

The `parameter-metadata` section contains information about `description`, `unit` and `aggregation-method` of the parameters of the inputs and outputs

- `inputs`: describe the parameters of the `inputs`. Each parameter has:

  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: aggregation method of the parameter (it can be `sum`, `avg` or `none`)

- `outputs`: describe the parameters in the `output` of the config block. The parameter has the following attributes:
  - `description`: description of the parameter
  - `unit`: unit of the parameter
  - `aggregation-method`: aggregation method of the parameter (it can be `sum`, `avg` or `none`)

### Mapping

The `mapping` block is an optional block. It is added in the plugin section and allows renaming the parameters of the input and output. The parameter with the new name will persist in the outputs. The structure of the `mapping` block is:

```yaml
cloud-metadata:
  method: CSVLookup
  path: 'builtin'
  mapping:
    'old-name': 'new-name'
```

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
const parametersMetadata = {inputs: {}, outputs: {}};
const mapping = {};
const csvLookup = CSVLookup(globalConfig);

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
  plugins:
    cloud-metadata:
      method: CSVLookup
      path: 'builtin'
      global-config:
        filepath: https://raw.githubusercontent.com/Green-Software-Foundation/if-data/main/region-metadata.csv
        query:
          cloud-provider: 'cloud/provider'
          cloud-region: 'cloud/region'
        output: '*'
      mapping:
        cloud/region: cloud/area
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

## Errors

Coefficient exposes six of the IF error classes.

### FetchingFileError

This error is caused by problems finding the file at the path provided in the `filepath`. If the file is on your local filesystem, you can check that the file is definitely there. For a remote file, check your internet connection. You can check your connection to the server using a tool such as `ping` or `curl`. if you still experience problems, you could retrieve the remote file onto your local filesystem using a tool such as `wget`.

### ReadFileError,

This error is caused by problems reading the CSV file provided in the `filepath`. To fix it, check that the file contains valid CSV data. The file should have a `.csv` file extension and the data inside should be formatted correctly.

### MissingCSVColumnError,

This error is caused by `CsvLookup` failing to find a column in the CSV file whose name matches what was provided in `query`. To debug, check that you do not have any typos in your `query` and confirm that the requested column name definitely exists in the target file.

### QueryDataNotFoundError,

This error is caused by the `CsvLookup` plugin failing to find data that matches your query. Try revising your query parameters.

### CSVParseError,

This error arises due to problems parsing CSV data into IF. This can occur when the CSV data is incorrectly formatted or contains unexpected characters that IF does not recognize. These errors are expected to be unusual edge cases as incorrectly formatted data will usually be identified during file loading and cause a `ReadFileError`. To debug, check your CSV file for any unexpected formatting or unusual characters.

### GlobalConfigError

You will receive an error starting `GlobalConfigError: ` if you have not provided the expected configuration data in the plugin's `initialize` block.

The required parameters are:

- `filepath`: This must be a path to a csv file
- `query`: this must be an array of key-value pairs where the key is a string containing a column name an the value is a string containing the name of a value in `inputs`
- `output`: this must be a string containing a name or a wildcard character (`"*"`)

You can fix this error by checking you are providing valid values for each parameter in the config.

For more information on our error classes, please visit [our docs](https://if.greensoftware.foundation/reference/errors)
