/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  modulePathIgnorePatterns: [
    './build',
    './src/__tests__/unit/lib/manifest',
    './src/__tests__/integration/helpers',
    './src/__tests__/integration/test-data',
  ],
};
