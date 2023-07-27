import {BoaviztaCpuImpactModel, BoaviztaCpuParams} from "../lib/boavizta";

async function test() {
    const newModel = new BoaviztaCpuImpactModel();
    const params = new BoaviztaCpuParams();
    params.allocation = 'TOTAL';
    params.verbose = true;
    params.name = 'Intel Xeon Platinum 8160 Processor'
    params.coreUnits = 2;
    newModel.configureTyped('test', params);
    const usage = await newModel.usage([
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
