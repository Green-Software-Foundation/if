import {ManifestParameter} from '../../common/types/manifest';

export const AGGREGATION_TYPES = ['sum', 'none', 'avg'] as const;

type ParameterProps = Omit<ManifestParameter, 'name'>;

export type Parameters = Record<string, ParameterProps>;
