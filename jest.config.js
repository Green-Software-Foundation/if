/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/__tests__/**/*.[jt]s'],
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  modulePathIgnorePatterns: ['<rootDir>/build/'],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/.*/config/.*',
    '<rootDir>/src/.*/types/.*',
  ],
};
