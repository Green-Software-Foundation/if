import {BoaviztaCpuImpactModel} from "../lib";

async function test() {
    const newModel = new BoaviztaCpuImpactModel();
    const params: { [key: string]: any } = {};
    params.allocation = 'TOTAL';
    params.verbose = true;
    params.name = 'Intel Xeon Platinum 8160 Processor'
    params.coreUnits = 2;
    newModel.configure('test', params);
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
    console.log(usage);
}

test();
