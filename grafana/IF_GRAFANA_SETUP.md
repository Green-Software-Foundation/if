# Setting up the Impact Framework Grafana dashboard
(for any questions please contact paz.barda@intel.com / pazbarda@gmail.com)

## Download and Install Grafana
https://grafana.com/get/?plcmt=top-nav&cta=downloads&tab=self-managed

This is the self managed version: you install it and can run it on your local machine. 

## Open Grafana on your local machine
Web browser: localhost:3000

You should see the Grafana welcome page.

## Download and Install Grafana CSV plugin
https://grafana.com/grafana/plugins/marcusolsson-csv-datasource/?tab=installation

After installation, go to Menu -> Plugins, search for "CSV" and make sure CSV plugin is there

## Import the dashboard json config

Menu -> Dashboards -> New -> Import

1. Drag and drop "grafana_config.json" from this folder to Grafana webpage
2. Optional - change the name of the dashboard and the details text on the right
3. Click import.

Dashboard should now appear, but with no data fed into the charts (yet).

## Create a data source for your OMPL CSV file
Menu -> Connections -> Data Sources -> Add data source

1. Search for "CSV", you should see the CSV plugin. Click it.
2. Name you new data source.
3. Switch from "HTTP" to "Local".
4. Type/paste in the path to your ompl csv ("your/path/to/csvs/if-iee-demo.csv" in our example)

Click Save & Test



## Connect your OMPL CSV data source to your dashboard

Menu -> Dashboards -> Select your new dashboard 

For each blank chart:

1. Click the chart menu -> edit
2. Below the chart go to Quary tab
3. At the top of the tab select the ompl CSV datasource you created
4. Go to Transform tab, and select the fields you'd like to show on the chart.
5. Start with "timestamp" and convert it to "Time".
6. Any other numeric value you'd like to show should be converted to "Number"

Click Apply

Click Save

NOTE: when you select a CSV file (step 3) it might initially not show the columns in the transformation dropdown. if that happens - save the dashboard, exit it refresh the Grafana webpage (localhost:3000). Once you go into the dashboard again it should show the columns for transformation. 


## Enable auto-refresh of the dashboard

On the top right of the dashboard, look for the "refresh dashboard" button

Click the dropdown next to it, and choose the auto-refresh interval

Click Save

## Your dashboard is now ready to go!
With every change to you CSV file you should see it reflect on the dashboard momentarily.

