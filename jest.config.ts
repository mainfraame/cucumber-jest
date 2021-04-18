export default {
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: ['/node_modules/', '/example/', '/test/'],
    coverageReporters: ['json-summary'],
    moduleDirectories: ['test/example/node_modules', 'node_modules'],
    moduleFileExtensions: ['feature', 'js', 'json', 'ts', 'tsx'],
    setupFiles: [
        '<rootDir>/test/utils/window.ts',
        '<rootDir>/test/example/node_modules/jest-date-mock'
    ],
    setupFilesAfterEnv: [
        '<rootDir>/dist/init.js',
        '<rootDir>/test/world.ts',
        '<rootDir>/test/hooks.tsx',
        '<rootDir>/test/steps.ts'
    ],
    testMatch: ['<rootDir>/test/**/*.feature'],
    testPathIgnorePatterns: ['/node_modules/'],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
        '^.+\\.(feature)$': '<rootDir>/dist/index.js'
    },
    testTimeout: 6000,
    verbose: true
};
