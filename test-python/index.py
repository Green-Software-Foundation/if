import json

import carbon_ql

component_params = carbon_ql.IBoaviztaStaticParams()
component_params.component_type = "cpu"

cpu_component = carbon_ql.BoaviztaComponentImpactModel().configure_typed(name="app_server",
                                                                         static_param_cast=component_params)
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
