module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.docker.spec.ts$',
  testTimeout: 30000, // 30-second timeout
  transform: {
    '^.+\.(t|j)s$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
};