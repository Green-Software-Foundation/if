export const STRINGS = {
  CHECKING: 'Checking...',
  IF_CHECK_FLAGS_MISSING:
    'Either the `--manifest` or `--directory` command should be provided with a path',
  DIRECTORY_NOT_FOUND: 'Directory not found.',
  DIRECTORY_YAML_FILES_NOT_FOUND:
    'The directory does not contain any YAML/YML files.\n',
  IF_CHECK_EXECUTING: (filename: string) => `Executing \`${filename}\``,
  IF_CHECK_VERIFICATION_FAILURES:
    '---------\nif-check verification failures:\n',
  IF_CHECK_FAILED: (filename: string) =>
    `✖ if-check could not verify ${filename}. The re-executed file does not match the original.\n`,
  IF_CHECK_VERIFIED: (filename: string) =>
    `✔ if-check successfully verified ${filename}\n`,
  IF_CHECK_SUMMARY_ERROR_MESSAGE: (filename: string, message: string) =>
    `Executing \`${filename}\`\n✖ ${message}`,
  IF_CHECK_SUMMARY_LOG: (passedCount: number, totalCount: number) =>
    `---------\nCheck summary:\n${passedCount} of ${totalCount} files are passed.\n`,
};
