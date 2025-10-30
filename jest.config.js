module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/tests/**',
  ],
  coverageThreshold: {
    // Strict thresholds for business logic (utils)
    './src/utils/**/*.js': {
      branches: 85,
      functions: 100,
      lines: 90,
      statements: 90,
    },
    // No global threshold - allows components to have lower coverage
    // while maintaining high coverage for critical business logic
  },
  testMatch: [
    '<rootDir>/src/tests/**/*.test.js',
    '<rootDir>/src/tests/**/*.test.jsx',
  ],
};
