import {IFCheckMetadataArgs} from '../types/process-args';
import {parse} from 'ts-command-line-args';
import {CONFIG} from '../config/config';
import {runHelpCommand} from '../../common/util/helpers';
import {load} from '../../common/lib/load';
import {validateManifest} from '../../common/util/validations';

const {ARGS} = CONFIG;

const validateAndParseIFCheckMetadataArgs = (): IFCheckMetadataArgs => {
  try {
    return parse<IFCheckMetadataArgs>(ARGS);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      runHelpCommand('if-check-metadata');
    }
    throw error;
  }
};

export const parseIFCheckMetadataArgs = async () => {
  const {manifest, parameters} = validateAndParseIFCheckMetadataArgs();
  const {rawManifest} = await load(manifest);
  const validatedManifest = validateManifest(rawManifest);
  return {...validatedManifest, parameters};
};
