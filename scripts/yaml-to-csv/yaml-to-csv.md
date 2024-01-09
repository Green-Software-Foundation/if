# YML to CSV shell model
This is a shell model (python script) that produces a CSV file from an ompl YML file

## Usage
> python path/to/your/if-yaml-to-csv.py -c path/to/your/output.csv

In this default usage:
1. The script will listen on STDIN for input impl.
2. The output CSV will be created / overwritten in the specified path.
3. By default, only *timestamp*, *duration*, *energy* and *carbon* fields are projected as columns to the CSV file. To change this, see 'Optional arguments'

### Optional arguments:
> *-y*

Path to input yml file (ompl). Using this option will override the default input method of listening on STDIN.

> *-p*

Comma separated (no spaces!) names of fields to project from input yml to output CSV as columns. Default = *timestamp,duration,energy,carbon*. Putting an emply list here (""") will project all ompl output fields.

> *-j*

Left-join the resulting CSV data to existing CSV file. Boolean switch, no argument values. 
- Default join keys are *timestamp,duration*. To change this, use the *-jk* option.
- In case of identical column names between existing and new data, new column names will be added with *"_new"* suffix.
- If there is no pre-existing file at the path specified under *-c*, *-j* is ignored (along with other join-related options) 

> *-jk*

Comma separated (no spaces!) names of columns to join by. Default = *timestamp,duration*. Relevant only when using --join (-j) option.

> *-js*

Suffix to add to ALL projected columns in the new data CSV data. Relevant only when using --join (-j) option.

#### Example:
> python path/to/your/if-yaml-to-csv.py -y path/to/your/ompl.yml -c path/to/your/output.csv -p timestamp,duration,energy,carbon,location -j -jk duration,location -js "_MY_SUFFIX"

This will:
- Convert the content of *path/to/your/ompl.yml* file into CSV format data, instead of listening to input on SDTIN.
- project the *location* field to the CSV data, alongside the default timestamp, duration, energy and carbon fields.
- left-join the resulting CSV data to the data already existing in the path specified under *-c*, using duration, location columns as join keys. 
- will add "_MY_SUFFIX" suffix to ALL columns in the new CSV data.


## Integrating the script in your IMPL as a shell model


    initialize:
        models:
        ...
        ...
        - name: yaml-to-csv
          model: ShellModel
          path: "@grnsft/if-models"

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
