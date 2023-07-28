#!/usr/bin/env python3
import argparse

import carbon_ql
import yaml


class ImpactConsole:
    impact_data = {}
    plugins = {}

    def load_data_from_file(self, file: str):
        with open(file) as f:
            data = yaml.load(f, Loader=yaml.FullLoader)
            self.impact_data = data

    def register_plugin(self, plugin: carbon_ql.IImpactModelInterface):
        self.plugins[plugin.model_identifier()] = plugin

    def process(self):
        for component in self.impact_data.get('components'):
            if component.get('model', {}).get('path', '') not in self.plugins:
                continue
            model = component.get('model', {}).get('path', '')
            # reinitialize the plugin
            self.plugins[model] = self.plugins[model].__class__()
            self.plugins[model].configure(component.get('name', ''), component.get('params', {}))
            print(self.plugins[model].calculate(component.get('observations', {}).get('series', [])))


parser = argparse.ArgumentParser(description='Impact Console')
parser.add_argument('file',
                    metavar='F',
                    type=str,
                    nargs=1,
                    help='file path to be processed')
args = parser.parse_args()

impactConsole = ImpactConsole()
impactConsole.register_plugin(carbon_ql.BoaviztaCloudImpactModel())
impactConsole.register_plugin(carbon_ql.BoaviztaCpuImpactModel())
impactConsole.load_data_from_file(args.file[0])
impactConsole.process()
