import {describe, expect, test} from '@jest/globals';
import {BoaviztaCpuImpactModel} from "./boavizta";

describe('initialization test', () => {
    test('', async () => {
        const impactModel = new BoaviztaCpuImpactModel();
        impactModel.configure('test');
        expect(impactModel.name).toBe('test');
        // initialization without static params will cause improper initialization error
        await expect(impactModel.usage())
            .rejects
            .toStrictEqual(
                Error("Improper Initialization: Missing configuration parameters")
            )
    });
});
