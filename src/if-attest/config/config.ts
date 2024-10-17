import { ArgumentConfig, ParseOptions } from 'ts-command-line-args';
import { STRINGS as COMMON_STRINGS } from '../../common/config';
import { IFAttestArgs } from '../types/process-args';

const { DISCLAIMER_MESSAGE } = COMMON_STRINGS;

export const CONFIG = {
    ARGS: {
        manifest: {
            type: String,
            optional: false,
            alias: 'm',
            description: '[path to the manifest file]',
        },
        blockchain: {
            type: Boolean,
            optional: true,
            alias: 'b',
            description:
                '[Boolean to toggle posting attestation to blockchain (true to post, false to save locally)]',
        },
        level: {
            type: Number,
            optional: true,
            alias: 'l',
            description:
                '[Audit level being attested to - integers from 1-5]',
        },
        unit: {
            type: String,
            optional: true,
            alias: 'u',
            description:
                '[The functional unit used to calculate SCI]',
        },
    } as ArgumentConfig<IFAttestArgs>,
    HELP: {
        helpArg: 'help',
        headerContentSections: [
            { header: 'Impact Framework', content: 'IF-Attest Helpful keywords:' },
        ],
        footerContentSections: [
            { header: 'Green Software Foundation', content: DISCLAIMER_MESSAGE },
        ],
    } as ParseOptions<any>,
};

export const STRINGS = {
    MANIFEST_IS_NOT_YAML: (path: string) =>
        `The \`${path}\` is not in yaml format.`,
};
