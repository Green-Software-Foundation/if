import json

import carbon_ql

cpu_component = carbon_ql.BoaviztaComponentImpactModel().create_typed(name="app_server",
                                                                      static_params={"componentType": "cpu"})
print(json.dumps(
    cpu_component.usage(
        {
            "core_units": 2,
            "name": "Intel Xeon Platinum 8272CL",
            "usage": {
                "hours_use_time": 0.05,
                "usage_location": "USA",
                "time_workload": 18.392,
            }
        }
    )
))

print(json.dumps(
    cpu_component.usage(
        {
            "core_units": 2,
            "name": "Intel SP8160",
            "usage": {
                "hours_use_time": 1,
                "usage_location": "USA",
                "time_workload": 10,
            }
        }
    )
))


