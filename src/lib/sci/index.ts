import { IImpactModelInterface } from '../interfaces';
import { KeyValuePair } from '../../types/boavizta';

export class SciModel implements IImpactModelInterface {
    authParams: object | undefined = undefined;
    staticParams: object | undefined;
    name: string | undefined;
    time: string | unknown;
    factor: number = 1;

    authenticate(authParams: object): void {
        this.authParams = authParams;
    }

    async calculate(observations: object | object[] | undefined): Promise<any[]> {
        if (!Array.isArray(observations)) {
            throw new Error('observations should be an array');
        }
        observations.map((observation: KeyValuePair) => {
            if (!('operational-emissions' in observation)) {
                throw new Error('observation missing `operational-emissions`');
            }
            if (!('embodied-carbon' in observation)) {
                throw new Error('observation missing `embodied-carbon`');
            }

            const emissions = parseFloat(observation['operational-emissions']);
            const embodied = parseFloat(observation['embodied-carbon']);
            const sci_secs = emissions + embodied; // sci in time units of /s
            let sci_timed: number = sci_secs;

            if ((this.time == 'second') || (this.time == 'seconds') || (this.time == '')) {
                sci_timed = sci_secs
            }
            if ((this.time == 'minute') || (this.time == 'minutes')) {
                sci_timed = sci_secs * 60
            }
            if ((this.time == 'hour') || (this.time == 'hours')) {
                sci_timed = sci_secs * 60 * 60
            }
            if ((this.time == 'day') || (this.time == 'days')) {
                sci_timed = sci_secs * 60 * 60 * 24
            }
            if ((this.time == 'week') || (this.time == 'weeks')) {
                sci_timed = sci_secs * 60 * 60 * 24 * 7
            }
            if ((this.time == 'month') || (this.time == 'months')) {
                sci_timed = sci_secs * 60 * 60 * 24 * 7 * 4
            }
            if ((this.time == 'year') || (this.time == 'years')) {
                sci_timed = sci_secs * 60 * 60 * 24 * 365
            }

            const factor = this.factor;
            observation['sci'] = sci_timed / factor;
            return observation;
        });

        return Promise.resolve(observations);
    }

    async configure(
        name: string,
        staticParams: object | undefined
    ): Promise<IImpactModelInterface> {
        if (staticParams === undefined) {
            throw new Error('Required Parameters not provided');
        }

        this.staticParams = staticParams;
        this.name = name;

        if ('time' in staticParams) {
            this.time = staticParams?.time;
        }
        if (('factor' in staticParams) && typeof (staticParams.factor) == 'number') {
            this.factor = staticParams?.factor;
        }

        return this;
    }

    modelIdentifier(): string {
        return 'org.gsf.sci';
    }
}
