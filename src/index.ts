import {BoaviztaCpuImpactModel} from "../lib";

async function test() {
    const params: { [key: string]: any } = {};
    params.allocation = 'TOTAL';
    params.verbose = true;
    params.name = 'Intel Xeon Platinum 8160 Processor'
    params.core_units = 24;
    const newModel = await (new BoaviztaCpuImpactModel()).configure('test', params);
    const usage = await newModel.calculate([
        {
            "hours_use_time": 1,
            "usage_location": "USA",
            "time_workload": 5,
        },
        {
            "hours_use_time": 1,
            "usage_location": "USA",
            "time_workload": 5,
        }
    ])
    const usage2 = await newModel.calculate([
        {
            "datetime": "2021-01-01T00:00:00Z",
            "duration": '15s',
            "cpu": 0.34,
        },
        {
            "datetime": "2021-01-01T00:00:15Z",
            "duration": '15s',
            "cpu": 0.12,
        },
        {
            "datetime": "2021-01-01T00:00:30Z",
            "duration": '15s',
            "cpu": 0.01,
        },
        {
            "datetime": "2021-01-01T00:00:45Z",
            "duration": '15s',
            "cpu": 0.78,
        },
    ])
    console.log(usage);
    console.log(usage2);
}

test();
