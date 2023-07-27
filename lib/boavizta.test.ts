import {describe, expect, test} from '@jest/globals';
import {BoaviztaCpuImpactModel} from "./boavizta";

describe('initialization test', () => {

    test('initialize without params', async () => {
        const impactModel = new BoaviztaCpuImpactModel();
        impactModel.configure('test');
        expect(impactModel.name).toBe('test');
    });
    test('initialize without params and call usage', async () => {
        const impactModel = new BoaviztaCpuImpactModel();
        impactModel.configure('test');
        expect(impactModel.name).toBe('test');
        // initialization without static params will cause improper initialization error
        await expect(impactModel.calculate())
            .rejects
            .toStrictEqual(
                Error("Improper Initialization: Missing configuration parameters")
            )
    });
});
describe('initialize with params', () => {
    test('initialize with params and call usage', async () => {
        const impactModel = new BoaviztaCpuImpactModel();
        impactModel.configure('test', {name: 'Intel Xeon Platinum 8160 Processor', coreUnits: 2});
        expect(impactModel.name).toBe('test');
        // initialization without static params will cause improper initialization error
        await expect(impactModel.calculate({
            "hours_use_time": 1,
            "usage_location": "USA",
            "time_workload": 50,
        }))
            .resolves
            .toStrictEqual(
                {"e": 0.5555555555555556, "m": 23800}
            )
    });
    test('initialize with params and call multiple usages', async () => {
        const impactModel = new BoaviztaCpuImpactModel();
        impactModel.configure('test', {name: 'Intel Xeon Platinum 8160 Processor', coreUnits: 2});
        expect(impactModel.name).toBe('test');
        // initialization without static params will cause improper initialization error
        await expect(impactModel.calculate([{
            "hours_use_time": 1,
            "usage_location": "USA",
            "time_workload": 50,
        },
            {
                "hours_use_time": 1,
                "usage_location": "USA",
                "time_workload": 50,
            }]))
            .resolves
            .toStrictEqual(
                {"e": 0.5555555555555556 * 2, "m": 23800}
            )
    });
    test('initialize with params and call multiple usages', async () => {
        const impactModel = new BoaviztaCpuImpactModel();
        impactModel.configure('test', {
            name: 'Intel Xeon Gold 6138f',
            coreUnits: 24,
            location: 'USA'
        });
        expect(impactModel.name).toBe('test');
        // initialization without static params will cause improper initialization error
        await expect(impactModel.calculate([
            {
                "duration": '15s',
                "cpu": 0.34,
            },
            {
                "duration": '15s',
                "cpu": 0.12,
            },
            {
                "duration": '15s',
                "cpu": 0.01,
            },
            {
                "duration": '15s',
                "cpu": 0.78,
            },
        ]))
            .resolves
            .toStrictEqual(
                {"e": 1.1111111111111112, "m": 23800}
            )
    });
});
