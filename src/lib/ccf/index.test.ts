import {describe, jest, test} from '@jest/globals';
import {CloudCarbonFootprint} from "./index";

jest.setTimeout(30000);

describe('ccf:configure test', () => {

    test('initialize without params should throw error', async () => {
        const impactModel = new CloudCarbonFootprint();
        await impactModel.configure('test');
    });
});
