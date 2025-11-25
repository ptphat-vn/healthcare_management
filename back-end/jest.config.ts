import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1'
  },
  setupFiles: ['<rootDir>/test/setup-env.ts'],
  clearMocks: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/**/*.d.ts', '!<rootDir>/src/**/*.types.ts'],
  coverageDirectory: '<rootDir>/coverage',
  testPathIgnorePatterns: ['/node_modules/', '/dist/']
}

export default config

