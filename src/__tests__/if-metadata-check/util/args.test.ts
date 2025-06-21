import {parseIFCheckMetadataArgs} from '../../../if-metadata-check/util/args';
import {parse} from 'ts-command-line-args';
import {CONFIG} from '../../../if-metadata-check/config/config';
import {runHelpCommand} from '../../../common/util/helpers';
import {load} from '../../../common/lib/load';
import {validateManifest} from '../../../common/util/validations';

jest.mock('ts-command-line-args');
jest.mock('../../../if-metadata-check/config/config', () => ({
  CONFIG: {
    ARGS: {},
  },
}));
jest.mock('../../../common/util/helpers', () => ({
  runHelpCommand: jest.fn(),
}));
jest.mock('../../../common/lib/load', () => ({
  load: jest.fn(),
}));
jest.mock('../../../common/util/validations', () => ({
  validateManifest: jest.fn(),
}));

describe('args.ts', () => {
  describe('parseIFCheckMetadataArgs', () => {
    const mockManifest = 'mockManifestPath';
    const mockParameters = {key: 'value'};
    const mockRawManifest = {raw: 'data'};
    const mockValidatedManifest = {validated: 'data'};

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should parse arguments, load the manifest, validate it, and return the result', async () => {
      (parse as jest.Mock).mockReturnValue({
        manifest: mockManifest,
        parameters: mockParameters,
      });
      (load as jest.Mock).mockResolvedValue({rawManifest: mockRawManifest});
      (validateManifest as jest.Mock).mockReturnValue(mockValidatedManifest);

      const result = await parseIFCheckMetadataArgs();

      expect(parse).toHaveBeenCalledWith(CONFIG.ARGS);
      expect(load).toHaveBeenCalledWith(mockManifest);
      expect(validateManifest).toHaveBeenCalledWith(mockRawManifest);
      expect(result).toEqual({
        ...mockValidatedManifest,
        parameters: mockParameters,
      });
    });

    it('should call runHelpCommand and throw an error if argument parsing fails', async () => {
      const mockError = new Error('Parsing error');
      (parse as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      await expect(parseIFCheckMetadataArgs()).rejects.toThrow(mockError);
      expect(runHelpCommand).toHaveBeenCalledWith('if-check-metadata');
    });

    it('should throw an error if loading the manifest fails', async () => {
      const mockError = new Error('Loading error');
      (parse as jest.Mock).mockReturnValue({
        manifest: mockManifest,
        parameters: mockParameters,
      });
      (load as jest.Mock).mockRejectedValue(mockError);

      await expect(parseIFCheckMetadataArgs()).rejects.toThrow(mockError);
      expect(load).toHaveBeenCalledWith(mockManifest);
    });

    it('should throw an error if manifest validation fails', async () => {
      const mockError = new Error('Validation error');
      (parse as jest.Mock).mockReturnValue({
        manifest: mockManifest,
        parameters: mockParameters,
      });
      (load as jest.Mock).mockResolvedValue({rawManifest: mockRawManifest});
      (validateManifest as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      await expect(parseIFCheckMetadataArgs()).rejects.toThrow(mockError);
      expect(validateManifest).toHaveBeenCalledWith(mockRawManifest);
    });
  });
});
