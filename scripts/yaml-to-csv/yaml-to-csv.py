import sys
import yaml
import pandas
import os
import argparse


default_projection_list = 'timestamp,duration,energy,carbon'
default_join_keys = 'timestamp,duration'


def parse_arguments():
    parser = argparse.ArgumentParser(description='Impact Framework yaml-to-csv parser')
    parser.add_argument('-y', '--yml', type=str, help='Path to input yml file')
    parser.add_argument('-c', '--csv', type=str, help='Path to output csv file')
    parser.add_argument('-p', '--project', type=str, default=default_projection_list, help=f'Comma separated (no spaces!) names of fields to project from input yml to output CSV as columns. Default ={default_projection_list}')
    parser.add_argument('-j', '--join', action='store_true', help='Join the resulting CSV data to existing CSV file')
    parser.add_argument('-jk', '--join_keys', type=str, default=default_join_keys, help=f'Comma separated (no spaces!) names of columns to join by. Default ={default_join_keys}. Relevant only when using --join (-j) option')
    parser.add_argument('-js', '--join_suffix', type=str, help='Suffix to add to projected columns in resulting CSV data. Relevant only when using --join (-j) option')
    args = parser.parse_args()
    return args


def get_yaml_data(input_yaml_path):
    if input_yaml_path is not None:
        return read_yaml_file(input_yaml_path)
    else:
        input_yaml_string = sys.stdin.read()
        return input_yaml_string


def read_yaml_file(input_yaml):
    try:
        with open(input_yaml, 'r') as yaml_file:
            yaml_string = yaml_file.read()
        yaml_data = yaml.safe_load(yaml_string)
        return yaml_data["graph"]["children"]["child"]
    except FileNotFoundError:
        print(f"Input YAML file '{input_yaml}' not found.")
        sys.exit(1)


def read_and_project_yaml_data(yaml_data, projection_list):
    yaml_obj = yaml.safe_load(yaml_data)
    output_yaml_data = yaml_obj["inputs"]
    outputs_df = pandas.json_normalize(output_yaml_data)
    filtered_df = outputs_df[projection_list] if projection_list else outputs_df
    return filtered_df


def write_to_csv_file(df_to_write, output_csv_path):
    csv_data = df_to_write.to_csv()
    with open(output_csv_path, 'w', newline='') as csv_file:
        csv_file.write(csv_data)


def validate_file_exists(file_path):
    if not os.path.exists(file_path):
        raise Exception(f"unable to join: file {file_path} doesn't exist")


def rename_columns(df, join_keys, projection_list, suff):
    cols_to_rename = list(filter(lambda x: x not in join_keys, projection_list))
    new_column_names = [col_name + "_" + suff for col_name in cols_to_rename]
    rename_dict = dict(zip(cols_to_rename, new_column_names))
    df_result = df.rename(columns=rename_dict)
    return df_result


def do_new(yaml_data, output_csv_path, projection_list):
    filtered_df = read_and_project_yaml_data(yaml_data, projection_list)
    write_to_csv_file(filtered_df, output_csv_path)


def do_join(yaml_data, output_csv_path, projection_list, join_keys, suff=""):
    if not os.path.exists(output_csv_path):
        do_new(yaml_data, output_csv_path, projection_list)
    else:
        filtered_df = read_and_project_yaml_data(yaml_data, projection_list)
        if suff is None or len(suff) == 0:
            outputs_df_to_join = filtered_df
        else:
            outputs_df_to_join = rename_columns(filtered_df, join_keys, projection_list, suff)
        df_existing = pandas.read_csv(output_csv_path)
        df_merged = df_existing.merge(outputs_df_to_join, on=join_keys, how="left", suffixes=("", "_new"))
        write_to_csv_file(df_merged, output_csv_path)


args = parse_arguments()

input_yaml_path = args.yml
output_csv_path = args.csv
projection_list = args.project.split(',')

yaml_data = get_yaml_data(input_yaml_path)
if args.join:
    join_keys = args.join_keys.split(',')
    join_suffix = args.join_suffix
    do_join(yaml_data, output_csv_path, projection_list, join_keys, join_suffix)
else:
    do_new(yaml_data, output_csv_path, projection_list)
sys.stdout.write(str(yaml_data))
