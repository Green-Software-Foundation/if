import { TimeSyncModel } from '../../../models';

// const {ModelInitializationError} = ERRORS;

// const {
//   MISSING_CLASSNAME,
//   MISSING_PATH,
//   NOT_INITIALIZED_MODEL,
//   NOT_NATIVE_MODEL,
//   NOT_MODEL_PLUGIN_EXTENSION,
//   NOT_CONSTRUCTABLE_MODEL,
//   INVALID_MODULE_PATH,
// } = STRINGS;

describe('models/time-sync: ', () => {
    describe('initialize time model', () => {
        it('initializes object with required properties.', () => {
            const timeModel = new TimeSyncModel();
            expect(timeModel).toHaveProperty('configure');
            expect(timeModel).toHaveProperty('execute');
        });
    });
});

describe('configure time model', () => {
    it('configures object with required properties.', () => {
        const timeModel = new TimeSyncModel();
        expect(typeof timeModel.configure({
            'start-time': '2023-12-12T00:00:00.000Z',
            'end-time': '2023-12-12T00:01:00.000Z',
            interval: 5
        })).toBe('object');
        expect(timeModel.startTime).toEqual('2023-12-12T00:00:00.000Z');
        expect(timeModel.endTime).toEqual('2023-12-12T00:01:00.000Z');
        expect(timeModel.interval).toEqual(5);
    })
});