import {describe, expect, jest, test} from '@jest/globals';
import {CloudCarbonFootprint} from "./index";

jest.setTimeout(30000);

describe('ccf:configure test', () => {
    test('initialize with params', async () => {
        const impactModel = new CloudCarbonFootprint();
        await impactModel.configure('test', {'provider': 'aws', 'instance_type': 't2.micro'});
        await expect(impactModel.calculate([{'duration': 3600, 'cpu': 0.5, 'datetime': '2021-01-01T00:00:00Z'}]))
            .resolves
            .toStrictEqual([
                {
                    e:0.004900000000000001,
                    m:0.04216723744292237
                },
            ]);
    });
    test('initialize with params', async () => {
        const impactModel = new CloudCarbonFootprint();
        await impactModel.configure('test', {'provider': 'aws', 'instance_type': 't2.micro'});
        await expect(impactModel.calculate([
            {
                'duration': 3600,
                'cpu': 0.5,
                'datetime': '2021-01-01T00:00:00Z'
            },
            {
                'duration': 3600,
                'cpu': 0.5,
                'datetime': '2021-01-02T00:00:00Z'
            }
        ]))
            .resolves
            .toStrictEqual([
                {
                    e:0.004900000000000001,
                    m:0.04216723744292237
                },
                {
                    e:0.004900000000000001,
                    m:0.04216723744292237
                },
            ]);

    });
});
