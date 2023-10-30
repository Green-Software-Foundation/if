import {IOutputModelInterface} from '../interfaces';

import {CONFIG} from '../../config';

import {KeyValuePair} from '../../types/common';

const {MODEL_IDS} = CONFIG;
const {SCI_ACCENTURE} = MODEL_IDS;

export class SciAccentureModel implements IOutputModelInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;

  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  async execute(inputs: object | object[] | undefined): Promise<any[]> {
    if (!Array.isArray(inputs)) {
      throw new Error('inputs should be an array');
    }

    const tunedinputs = inputs.map((input: KeyValuePair) => {
      input['sci_total'] = input['sci'] * 1.05;

      if (isNaN(input['sci'])) {
        throw new Error('sci not computable');
      }

      return input;
    });

    return tunedinputs;
  }

  async configure(
    name: string,
    staticParams: object | undefined
  ): Promise<IOutputModelInterface> {
    this.staticParams = staticParams;
    this.name = name;
    return this;
  }

  modelIdentifier(): string {
    return SCI_ACCENTURE;
  }
}
