# YML to CSV shell plugin

This is a shell plugin (python script) that produces a CSV file from an output YML file

## Usage

> python path/to/your/if-yaml-to-csv.py -c path/to/your/output.csv

In this default usage:

1. The script will listen on STDIN for input impl.
2. The output CSV will be created / overwritten in the specified path.
3. By default, only _timestamp_, _duration_, _energy_ and _carbon_ fields are projected as columns to the CSV file. To change this, see 'Optional arguments'

### Optional arguments:

> _-y_

Path to input yml file (output). Using this option will override the default input method of listening on STDIN.

> _-p_

Comma separated (no spaces!) names of fields to project from input yml to output CSV as columns. Default = _timestamp,duration,energy,carbon_. Putting an emply list here (""") will project all output output fields.

> _-j_

Left-join the resulting CSV data to existing CSV file. Boolean switch, no argument values.

- Default join keys are _timestamp,duration_. To change this, use the _-jk_ option.
- In case of identical column names between existing and new data, new column names will be added with _"\_new"_ suffix.
- If there is no pre-existing file at the path specified under _-c_, _-j_ is ignored (along with other join-related options)

> _-jk_

Comma separated (no spaces!) names of columns to join by. Default = _timestamp,duration_. Relevant only when using --join (-j) option.

> _-js_

Suffix to add to ALL projected columns in the new data CSV data. Relevant only when using --join (-j) option.

#### Example:

> python path/to/your/if-yaml-to-csv.py -y path/to/your/output.yml -c path/to/your/output.csv -p timestamp,duration,energy,carbon,location -j -jk duration,location -js "\_MY_SUFFIX"

This will:

- Convert the content of _path/to/your/output.yml_ file into CSV format data, instead of listening to input on SDTIN.
- project the _location_ field to the CSV data, alongside the default timestamp, duration, energy and carbon fields.
- left-join the resulting CSV data to the data already existing in the path specified under _-c_, using duration, location columns as join keys.
- will add "\_MY_SUFFIX" suffix to ALL columns in the new CSV data.

## Integrating the script in your IMPL as a shell plugin

    initialize:
        plugins:
        ...
        ...
        yaml-to-csv:
          method: Shell
          path: "@grnsft/if-plugins"

    graph:
        children:
            child:
                pipeline:
                    ...
                    ...
                    - yaml-to-csv
                config:
                    ...
                    ...
                    yaml-to-csv:
                        executable: python path/to/your/if-yaml-to-csv.py -c path/to/your/output.csv -j
