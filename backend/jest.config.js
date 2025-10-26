module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testPathIgnorePatterns: ['/node_modules/', '.e2e-spec.ts'], // Ignore e2e tests for unit/integration runs
  // Add testMatch to include integration tests in the 'test' directory
  testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/test/**/*.integration.spec.ts'],
  setupFiles: ['<rootDir>/jest.setup.js'],
};