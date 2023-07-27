import json

import carbon_ql

component_params = {
    "name": "Intel Xeon Platinum 8272CL",
    "core_units": 2,
}
cpu_component = carbon_ql.BoaviztaCpuImpactModel().configure(name="app_server",
                                                             static_params=component_params)
print(json.dumps(
    cpu_component.calculate({
        "hours_use_time": 0.05,
        "usage_location": "USA",
        "time_workload": 18.392,
    })
))
component_params = {
    "name": "Intel SP8160",
    "core_units": 2,
    "location": "USA",
}
cpu_component2 = carbon_ql.BoaviztaCpuImpactModel().configure(name="app_server",
                                                              static_params=component_params)

print(json.dumps(
    cpu_component2.calculate([
        {
            "hours_use_time": 1,
            "usage_location": "USA",
            "time_workload": 10,
        },
        {
            "hours_use_time": 1,
            "usage_location": "USA",
            "time_workload": 10,
        },
    ])
))
print(json.dumps(
    cpu_component2.calculate([
        {
            "hours_use_time": 1,
            "time_workload": 82,
        },
    ])
))

print(json.dumps(
    cpu_component2.calculate([
        {
            "duration": "1h",
            "cpu": 0.82
        },
    ])
))
