import {describe, jest, test} from '@jest/globals';
import {CloudCarbonFootprint} from "./index";

jest.setTimeout(30000);

describe('ccf:configure test', () => {

    test('initialize without params should throw error', async () => {
        const impactModel = new CloudCarbonFootprint();
        await impactModel.configure('test', {'provider': 'aws', 'instance_type': 't2.micro'});
        const result = await impactModel.calculate([{'duration': 3600, 'cpu': 0.5, 'datetime': '2021-01-01T00:00:00Z'}])
        console.log(result);
    });
});
