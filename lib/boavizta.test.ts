import {describe, expect, jest, test} from '@jest/globals';
import {BoaviztaCloudImpactModel, BoaviztaCpuImpactModel} from "./boavizta";

jest.setTimeout(30000);

describe('cpu:configure test', () => {

    test('initialize without params should throw error', async () => {
        const impactModel = new BoaviztaCpuImpactModel();
        await expect(impactModel.configure('test')).rejects.toThrowError(Error("Improper configure: Missing name parameter"));
        expect(impactModel.name).toBe('test');
    });
    test('initialize wrong params should throw error', async () => {
        const impactModel = new BoaviztaCpuImpactModel();
        await expect(impactModel.configure('test', {'allocation': 'wrong'})).rejects.toThrowError();
        expect(impactModel.name).toBe('test');
    });
    test('initialize without params throws error for parameter and call calculate without params throws error for observation', async () => {
        const impactModel = new BoaviztaCpuImpactModel();
        await expect(impactModel.configure('test')).rejects.toThrow(Error("Improper configure: Missing name parameter"));
        expect(impactModel.name).toBe('test');
        // not providing observations will throw a missing observations error
        await expect(impactModel.calculate())
            .rejects
            .toStrictEqual(
                Error("Parameter Not Given: invalid observations parameter. Expecting an array of observations")
            )
        // improper observations will throw a invalid observations error
        await expect(impactModel.calculate([{"invalid": "observation"}]))
            .rejects
            .toStrictEqual(
                Error("Invalid Input: Invalid observations parameter")
            )
    });
});
describe('cpu:initialize with params', () => {
    test('initialize with params and call multiple usages in IMPL format', async () => {
        const impactModel = new BoaviztaCpuImpactModel();
        await expect(impactModel.configure('test', {
            name: 'Intel Xeon Gold 6138f',
            core_units: 24,
            location: 'USA'
        })).resolves.toBeInstanceOf(BoaviztaCpuImpactModel);
        expect(impactModel.name).toBe('test');
        // configure without static params will cause improper configure error
        await expect(impactModel.calculate([
            {
                "datetime": "2021-01-01T00:00:00Z",
                "duration": 3600,
                "cpu": 0.34,
            },
            {
                "datetime": "2021-01-01T00:00:15Z",
                "duration": 15,
                "cpu": 0.12,
            },
            {
                "datetime": "2021-01-01T00:00:30Z",
                "duration": 15,
                "cpu": 0.01,
            },
            {
                "datetime": "2021-01-01T00:00:45Z",
                "duration": 15,
                "cpu": 0.78,
            },
        ]))
            .resolves
            .toStrictEqual(
                [
                    { m: 0.905, e: 0.25 },
                    { m: 0.00377, e: 0.0007702777777777777 },
                    { m: 0.00377, e: 0.000439 },
                    { m: 0.00377, e: 0.0014238333333333332 }
                ]
            )
    });
});
describe('cloud:initialize with params', () => {
    test('initialize with params and call usage in RAW Format', async () => {
        const impactModel = new BoaviztaCloudImpactModel();
        await expect(
            impactModel.configure('test', {instance_type: 't2.micro', location: 'USA', provider: 'aws'})
        ).resolves.toBeInstanceOf(BoaviztaCloudImpactModel);
        expect(impactModel.name).toBe('test');
        // configure without static params will cause improper configure error
    });
    test('correct instance_type: initialize with params and call usage in IMPL Format', async () => {
        const impactModel = new BoaviztaCloudImpactModel();
        await expect(impactModel.configure('test', {
            instance_type: 't2.micro',
            location: 'USA',
            provider: 'aws'
        })).resolves.toBeInstanceOf(BoaviztaCloudImpactModel);
        expect(impactModel.name).toBe('test');
        // configure without static params will cause improper configure error
        await expect(impactModel.calculate(
            [
                {
                    "datetime": "2021-01-01T00:00:00Z",
                    "duration": 15,
                    "cpu": 0.34,
                },
                {
                    "datetime": "2021-01-01T00:00:15Z",
                    "duration": 15,
                    "cpu": 0.12,
                },
                {
                    "datetime": "2021-01-01T00:00:30Z",
                    "duration": 15,
                    "cpu": 0.01,
                },
                {
                    "datetime": "2021-01-01T00:00:45Z",
                    "duration": 15,
                    "cpu": 0.78,
                },
            ]
        ))
            .resolves
            .toStrictEqual({"e": 0.0002969, "m": 0.0040429984779299846});
    });
    test('wrong instance_type: initialize with params and call usage in IMPL Format throws error', async () => {
        const impactModel = new BoaviztaCloudImpactModel();
        await expect(impactModel.configure('test', {
            instance_type: 't5.micro',
            location: 'USA',
            provider: 'aws'
        })).rejects.toThrowError();
        expect(impactModel.name).toBe('test');
        // configure without static params will cause improper configure error
        await expect(impactModel.calculate(
            [
                {
                    "datetime": "2021-01-01T00:00:00Z",
                    "duration": 15,
                    "cpu": 0.34,
                },
                {
                    "datetime": "2021-01-01T00:00:15Z",
                    "duration": 15,
                    "cpu": 0.12,
                },
                {
                    "datetime": "2021-01-01T00:00:30Z",
                    "duration": 15,
                    "cpu": 0.01,
                },
                {
                    "datetime": "2021-01-01T00:00:45Z",
                    "duration": 15,
                    "cpu": 0.78,
                },
            ]
        ))
            .rejects
            .toThrowError();
    });
    test('without instance_type: initialize with params and call usage in IMPL Format throws error', async () => {
        const impactModel = new BoaviztaCloudImpactModel();
        await expect(
            impactModel.configure('test', {
                location: 'USA',
                provider: 'aws'
            })
        ).rejects.toStrictEqual(Error("Improper configure: Missing instance_type parameter"));
        expect(impactModel.name).toBe('test');
        // configure without static params will cause improper configure error
        await expect(impactModel.calculate(
            [
                {
                    "datetime": "2021-01-01T00:00:00Z",
                    "duration": 15,
                    "cpu": 0.34,
                },
                {
                    "datetime": "2021-01-01T00:00:15Z",
                    "duration": 15,
                    "cpu": 0.12,
                },
                {
                    "datetime": "2021-01-01T00:00:30Z",
                    "duration": 15,
                    "cpu": 0.01,
                },
                {
                    "datetime": "2021-01-01T00:00:45Z",
                    "duration": 15,
                    "cpu": 0.78,
                },
            ]
        ))
            .rejects
            .toStrictEqual(Error("Improper configure: Missing configuration parameters"));
    });
});
