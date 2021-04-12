/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

export default {
    // Automatically clear mock calls and instances between every test
    clearMocks: true,

    // The directory where Jest should output its coverage files
    coverageDirectory: 'coverage',

    // An array of file extensions your modules use
    moduleFileExtensions: ['feature', 'js', 'json', 'ts'],

    // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
    // moduleNameMapper: {},

    // An array of regexp pattern strings, matched against all module paths before considered 'visible' to the module loader
    // modulePathIgnorePatterns: [],

    // Activates notifications for test results
    // notify: false,

    // An enum that specifies notification mode. Requires { notify: true }
    // notifyMode: "failure-change",

    // A preset that is used as a base for Jest's configuration
    // preset: undefined,

    // Run tests from one or more projects
    // projects: undefined,

    // Use this configuration option to add custom reporters to Jest
    // reporters: undefined,

    // Automatically reset mock state between every test
    // resetMocks: false,

    // Reset the module registry before running each individual test
    // resetModules: false,

    // A path to a custom resolver
    // resolver: undefined,

    // Automatically restore mock state between every test
    // restoreMocks: false,

    // The root directory that Jest should scan for tests and modules within
    // rootDir: undefined,

    // A list of paths to directories that Jest should use to search for files in
    // roots: [
    //   "<rootDir>"
    // ],

    // Allows you to use a custom runner instead of Jest's default test runner
    // runner: "jest-runner",

    // The paths to modules that run some code to configure or set up the testing environment before each test
    // setupFiles: [],

    // A list of paths to modules that run some code to configure or set up the testing framework before each test
    setupFilesAfterEnv: ['<rootDir>/dist/init.js', '<rootDir>/test/steps.ts'],

    // The number of seconds after which a test is considered as slow and reported as such in the results.
    // slowTestThreshold: 5,

    // A list of paths to snapshot serializer modules Jest should use for snapshot testing
    // snapshotSerializers: [],

    // The test environment that will be used for testing
    testEnvironment: 'node',

    // Options that will be passed to the testEnvironment
    // testEnvironmentOptions: {},

    // Adds a location field to test results
    // testLocationInResults: false,

    // The glob patterns Jest uses to detect test files
    testMatch: ['<rootDir>/test/**/*.feature'],

    // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
    testPathIgnorePatterns: ['/node_modules/'],

    // A map from regular expressions to paths to transformers
    transform: {
        '^.+\\.(js|ts)$': 'babel-jest',
        '^.+\\.(feature)$': '<rootDir>/dist/index.js'
    },

    verbose: true
};
