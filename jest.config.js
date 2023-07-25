"use strict";
/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    // All imported modules in your tests should be mocked automatically
    automock: false,
    // Stop running tests after `n` failures
    // bail: 0,
    // The directory where Jest should store its cached dependency information
    // cacheDirectory: "/private/var/folders/qf/sc70vs_n6sl9d9ht9kphx4g00000gn/T/jest_dx",
    // Automatically clear mock calls, instances, contexts and results before every test
    clearMocks: true,
    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: true,
    // An array of glob patterns indicating a set of files for which coverage information should be collected
    // collectCoverageFrom: undefined,
    // The directory where Jest should output its coverage files
    coverageDirectory: "coverage",
    // An array of regexp pattern strings used to skip coverage collection
    // coveragePathIgnorePatterns: [
    //   "/node_modules/"
    // ],
    // Indicates which provider should be used to instrument code for coverage
    coverageProvider: "v8",
    // A list of reporter names that Jest uses when writing coverage reports
    // coverageReporters: [
    //   "json",
    //   "text",
    //   "lcov",
    //   "clover"
    // ],
    // An object that configures minimum threshold enforcement for coverage results
    // coverageThreshold: undefined,
    // A path to a custom dependency extractor
    // dependencyExtractor: undefined,
    // Make calling deprecated APIs throw helpful error messages
    // errorOnDeprecated: false,
    // The default configuration for fake timers
    // fakeTimers: {
    //   "enableGlobally": false
    // },
    // Force coverage collection from ignored files using an array of glob patterns
    // forceCoverageMatch: [],
    // A path to a module which exports an async function that is triggered once before all test suites
    // globalSetup: undefined,
    // A path to a module which exports an async function that is triggered once after all test suites
    // globalTeardown: undefined,
    // A set of global variables that need to be available in all test environments
    // globals: {},
    // The maximum amount of workers used to run your tests. Can be specified as % or a number. E.g. maxWorkers: 10% will use 10% of your CPU amount + 1 as the maximum worker number. maxWorkers: 2 will use a maximum of 2 workers.
    // maxWorkers: "50%",
    // An array of directory names to be searched recursively up from the requiring module's location
    // moduleDirectories: [
    //   "node_modules"
    // ],
    // An array of file extensions your modules use
    // moduleFileExtensions: [
    //   "js",
    //   "mjs",
    //   "cjs",
    //   "jsx",
    //   "ts",
    //   "tsx",
    //   "json",
    //   "node"
    // ],
    // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
    // moduleNameMapper: {},
    // An array of regexp pattern strings, matched against all module paths before considered 'visible' to the module loader
    // modulePathIgnorePatterns: [],
    // Activates notifications for test results
    // notify: false,
    // An enum that specifies notification mode. Requires { notify: true }
    // notifyMode: "failure-change",
    // A preset that is used as a base for Jest's configuration
    preset: 'ts-jest',
    // Run tests from one or more projects
    // projects: undefined,
    // Use this configuration option to add custom reporters to Jest
    // reporters: undefined,
    // Automatically reset mock state before every test
    // resetMocks: false,
    // Reset the module registry before running each individual test
    // resetModules: false,
    // A path to a custom resolver
    // resolver: undefined,
    // Automatically restore mock state and implementation before every test
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
    // setupFilesAfterEnv: [],
    // The number of seconds after which a test is considered as slow and reported as such in the results.
    // slowTestThreshold: 5,
    // A list of paths to snapshot serializer modules Jest should use for snapshot testing
    // snapshotSerializers: [],
    // The test environment that will be used for testing
    testEnvironment: "node",
    // Options that will be passed to the testEnvironment
    // testEnvironmentOptions: {},
    // Adds a location field to test results
    // testLocationInResults: false,
    // The glob patterns Jest uses to detect test files
    // testMatch: [
    //   "**/__tests__/**/*.[jt]s?(x)",
    //   "**/?(*.)+(spec|test).[tj]s?(x)"
    // ],
    // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
    // testPathIgnorePatterns: [
    //   "/node_modules/"
    // ],
    // The regexp pattern or array of patterns that Jest uses to detect test files
    // testRegex: [],
    // This option allows the use of a custom results processor
    // testResultsProcessor: undefined,
    // This option allows use of a custom test runner
    // testRunner: "jest-circus/runner",
    // A map from regular expressions to paths to transformers
    // transform: undefined,
    // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
    // transformIgnorePatterns: [
    //   "/node_modules/",
    //   "\\.pnp\\.[^\\/]+$"
    // ],
    // An array of regexp pattern strings that are matched against all modules before the module loader will automatically return a mock for them
    // unmockedModulePathPatterns: undefined,
    // Indicates whether each individual test should be reported during the run
    // verbose: undefined,
    // An array of regexp patterns that are matched against all source file paths before re-running tests in watch mode
    // watchPathIgnorePatterns: [],
    // Whether to use watchman for file crawling
    // watchman: true,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamVzdC5jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJqZXN0LmNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOztBQUVILGtCQUFlO0lBQ1gsb0VBQW9FO0lBQ3BFLFFBQVEsRUFBRSxLQUFLO0lBRWYsd0NBQXdDO0lBQ3hDLFdBQVc7SUFFWCwwRUFBMEU7SUFDMUUsc0ZBQXNGO0lBRXRGLG9GQUFvRjtJQUNwRixVQUFVLEVBQUUsSUFBSTtJQUVoQiwwRkFBMEY7SUFDMUYsZUFBZSxFQUFFLElBQUk7SUFFckIseUdBQXlHO0lBQ3pHLGtDQUFrQztJQUVsQyw0REFBNEQ7SUFDNUQsaUJBQWlCLEVBQUUsVUFBVTtJQUU3QixzRUFBc0U7SUFDdEUsZ0NBQWdDO0lBQ2hDLHFCQUFxQjtJQUNyQixLQUFLO0lBRUwsMEVBQTBFO0lBQzFFLGdCQUFnQixFQUFFLElBQUk7SUFFdEIsd0VBQXdFO0lBQ3hFLHVCQUF1QjtJQUN2QixZQUFZO0lBQ1osWUFBWTtJQUNaLFlBQVk7SUFDWixhQUFhO0lBQ2IsS0FBSztJQUVMLCtFQUErRTtJQUMvRSxnQ0FBZ0M7SUFFaEMsMENBQTBDO0lBQzFDLGtDQUFrQztJQUVsQyw0REFBNEQ7SUFDNUQsNEJBQTRCO0lBRTVCLDRDQUE0QztJQUM1QyxnQkFBZ0I7SUFDaEIsNEJBQTRCO0lBQzVCLEtBQUs7SUFFTCwrRUFBK0U7SUFDL0UsMEJBQTBCO0lBRTFCLG1HQUFtRztJQUNuRywwQkFBMEI7SUFFMUIsa0dBQWtHO0lBQ2xHLDZCQUE2QjtJQUU3QiwrRUFBK0U7SUFDL0UsZUFBZTtJQUVmLGlPQUFpTztJQUNqTyxxQkFBcUI7SUFFckIsaUdBQWlHO0lBQ2pHLHVCQUF1QjtJQUN2QixtQkFBbUI7SUFDbkIsS0FBSztJQUVMLCtDQUErQztJQUMvQywwQkFBMEI7SUFDMUIsVUFBVTtJQUNWLFdBQVc7SUFDWCxXQUFXO0lBQ1gsV0FBVztJQUNYLFVBQVU7SUFDVixXQUFXO0lBQ1gsWUFBWTtJQUNaLFdBQVc7SUFDWCxLQUFLO0lBRUwsb0lBQW9JO0lBQ3BJLHdCQUF3QjtJQUV4Qix3SEFBd0g7SUFDeEgsZ0NBQWdDO0lBRWhDLDJDQUEyQztJQUMzQyxpQkFBaUI7SUFFakIsc0VBQXNFO0lBQ3RFLGdDQUFnQztJQUVoQywyREFBMkQ7SUFDM0QsTUFBTSxFQUFFLFNBQVM7SUFFakIsc0NBQXNDO0lBQ3RDLHVCQUF1QjtJQUV2QixnRUFBZ0U7SUFDaEUsd0JBQXdCO0lBRXhCLG1EQUFtRDtJQUNuRCxxQkFBcUI7SUFFckIsZ0VBQWdFO0lBQ2hFLHVCQUF1QjtJQUV2Qiw4QkFBOEI7SUFDOUIsdUJBQXVCO0lBRXZCLHdFQUF3RTtJQUN4RSx1QkFBdUI7SUFFdkIsd0VBQXdFO0lBQ3hFLHNCQUFzQjtJQUV0Qiw2RUFBNkU7SUFDN0UsV0FBVztJQUNYLGdCQUFnQjtJQUNoQixLQUFLO0lBRUwsMEVBQTBFO0lBQzFFLHlCQUF5QjtJQUV6QiwwR0FBMEc7SUFDMUcsa0JBQWtCO0lBRWxCLDhHQUE4RztJQUM5RywwQkFBMEI7SUFFMUIsc0dBQXNHO0lBQ3RHLHdCQUF3QjtJQUV4QixzRkFBc0Y7SUFDdEYsMkJBQTJCO0lBRTNCLHFEQUFxRDtJQUNyRCxlQUFlLEVBQUUsTUFBTTtJQUV2QixxREFBcUQ7SUFDckQsOEJBQThCO0lBRTlCLHdDQUF3QztJQUN4QyxnQ0FBZ0M7SUFFaEMsbURBQW1EO0lBQ25ELGVBQWU7SUFDZixtQ0FBbUM7SUFDbkMscUNBQXFDO0lBQ3JDLEtBQUs7SUFFTCx3R0FBd0c7SUFDeEcsNEJBQTRCO0lBQzVCLHFCQUFxQjtJQUNyQixLQUFLO0lBRUwsOEVBQThFO0lBQzlFLGlCQUFpQjtJQUVqQiwyREFBMkQ7SUFDM0QsbUNBQW1DO0lBRW5DLGlEQUFpRDtJQUNqRCxvQ0FBb0M7SUFFcEMsMERBQTBEO0lBQzFELHdCQUF3QjtJQUV4Qiw0SEFBNEg7SUFDNUgsNkJBQTZCO0lBQzdCLHNCQUFzQjtJQUN0Qix3QkFBd0I7SUFDeEIsS0FBSztJQUVMLDZJQUE2STtJQUM3SSx5Q0FBeUM7SUFFekMsMkVBQTJFO0lBQzNFLHNCQUFzQjtJQUV0QixtSEFBbUg7SUFDbkgsK0JBQStCO0lBRS9CLDRDQUE0QztJQUM1QyxrQkFBa0I7Q0FDckIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBGb3IgYSBkZXRhaWxlZCBleHBsYW5hdGlvbiByZWdhcmRpbmcgZWFjaCBjb25maWd1cmF0aW9uIHByb3BlcnR5IGFuZCB0eXBlIGNoZWNrLCB2aXNpdDpcbiAqIGh0dHBzOi8vamVzdGpzLmlvL2RvY3MvY29uZmlndXJhdGlvblxuICovXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICAvLyBBbGwgaW1wb3J0ZWQgbW9kdWxlcyBpbiB5b3VyIHRlc3RzIHNob3VsZCBiZSBtb2NrZWQgYXV0b21hdGljYWxseVxuICAgIGF1dG9tb2NrOiBmYWxzZSxcblxuICAgIC8vIFN0b3AgcnVubmluZyB0ZXN0cyBhZnRlciBgbmAgZmFpbHVyZXNcbiAgICAvLyBiYWlsOiAwLFxuXG4gICAgLy8gVGhlIGRpcmVjdG9yeSB3aGVyZSBKZXN0IHNob3VsZCBzdG9yZSBpdHMgY2FjaGVkIGRlcGVuZGVuY3kgaW5mb3JtYXRpb25cbiAgICAvLyBjYWNoZURpcmVjdG9yeTogXCIvcHJpdmF0ZS92YXIvZm9sZGVycy9xZi9zYzcwdnNfbjZzbDlkOWh0OWtwaHg0ZzAwMDAwZ24vVC9qZXN0X2R4XCIsXG5cbiAgICAvLyBBdXRvbWF0aWNhbGx5IGNsZWFyIG1vY2sgY2FsbHMsIGluc3RhbmNlcywgY29udGV4dHMgYW5kIHJlc3VsdHMgYmVmb3JlIGV2ZXJ5IHRlc3RcbiAgICBjbGVhck1vY2tzOiB0cnVlLFxuXG4gICAgLy8gSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGNvdmVyYWdlIGluZm9ybWF0aW9uIHNob3VsZCBiZSBjb2xsZWN0ZWQgd2hpbGUgZXhlY3V0aW5nIHRoZSB0ZXN0XG4gICAgY29sbGVjdENvdmVyYWdlOiB0cnVlLFxuXG4gICAgLy8gQW4gYXJyYXkgb2YgZ2xvYiBwYXR0ZXJucyBpbmRpY2F0aW5nIGEgc2V0IG9mIGZpbGVzIGZvciB3aGljaCBjb3ZlcmFnZSBpbmZvcm1hdGlvbiBzaG91bGQgYmUgY29sbGVjdGVkXG4gICAgLy8gY29sbGVjdENvdmVyYWdlRnJvbTogdW5kZWZpbmVkLFxuXG4gICAgLy8gVGhlIGRpcmVjdG9yeSB3aGVyZSBKZXN0IHNob3VsZCBvdXRwdXQgaXRzIGNvdmVyYWdlIGZpbGVzXG4gICAgY292ZXJhZ2VEaXJlY3Rvcnk6IFwiY292ZXJhZ2VcIixcblxuICAgIC8vIEFuIGFycmF5IG9mIHJlZ2V4cCBwYXR0ZXJuIHN0cmluZ3MgdXNlZCB0byBza2lwIGNvdmVyYWdlIGNvbGxlY3Rpb25cbiAgICAvLyBjb3ZlcmFnZVBhdGhJZ25vcmVQYXR0ZXJuczogW1xuICAgIC8vICAgXCIvbm9kZV9tb2R1bGVzL1wiXG4gICAgLy8gXSxcblxuICAgIC8vIEluZGljYXRlcyB3aGljaCBwcm92aWRlciBzaG91bGQgYmUgdXNlZCB0byBpbnN0cnVtZW50IGNvZGUgZm9yIGNvdmVyYWdlXG4gICAgY292ZXJhZ2VQcm92aWRlcjogXCJ2OFwiLFxuXG4gICAgLy8gQSBsaXN0IG9mIHJlcG9ydGVyIG5hbWVzIHRoYXQgSmVzdCB1c2VzIHdoZW4gd3JpdGluZyBjb3ZlcmFnZSByZXBvcnRzXG4gICAgLy8gY292ZXJhZ2VSZXBvcnRlcnM6IFtcbiAgICAvLyAgIFwianNvblwiLFxuICAgIC8vICAgXCJ0ZXh0XCIsXG4gICAgLy8gICBcImxjb3ZcIixcbiAgICAvLyAgIFwiY2xvdmVyXCJcbiAgICAvLyBdLFxuXG4gICAgLy8gQW4gb2JqZWN0IHRoYXQgY29uZmlndXJlcyBtaW5pbXVtIHRocmVzaG9sZCBlbmZvcmNlbWVudCBmb3IgY292ZXJhZ2UgcmVzdWx0c1xuICAgIC8vIGNvdmVyYWdlVGhyZXNob2xkOiB1bmRlZmluZWQsXG5cbiAgICAvLyBBIHBhdGggdG8gYSBjdXN0b20gZGVwZW5kZW5jeSBleHRyYWN0b3JcbiAgICAvLyBkZXBlbmRlbmN5RXh0cmFjdG9yOiB1bmRlZmluZWQsXG5cbiAgICAvLyBNYWtlIGNhbGxpbmcgZGVwcmVjYXRlZCBBUElzIHRocm93IGhlbHBmdWwgZXJyb3IgbWVzc2FnZXNcbiAgICAvLyBlcnJvck9uRGVwcmVjYXRlZDogZmFsc2UsXG5cbiAgICAvLyBUaGUgZGVmYXVsdCBjb25maWd1cmF0aW9uIGZvciBmYWtlIHRpbWVyc1xuICAgIC8vIGZha2VUaW1lcnM6IHtcbiAgICAvLyAgIFwiZW5hYmxlR2xvYmFsbHlcIjogZmFsc2VcbiAgICAvLyB9LFxuXG4gICAgLy8gRm9yY2UgY292ZXJhZ2UgY29sbGVjdGlvbiBmcm9tIGlnbm9yZWQgZmlsZXMgdXNpbmcgYW4gYXJyYXkgb2YgZ2xvYiBwYXR0ZXJuc1xuICAgIC8vIGZvcmNlQ292ZXJhZ2VNYXRjaDogW10sXG5cbiAgICAvLyBBIHBhdGggdG8gYSBtb2R1bGUgd2hpY2ggZXhwb3J0cyBhbiBhc3luYyBmdW5jdGlvbiB0aGF0IGlzIHRyaWdnZXJlZCBvbmNlIGJlZm9yZSBhbGwgdGVzdCBzdWl0ZXNcbiAgICAvLyBnbG9iYWxTZXR1cDogdW5kZWZpbmVkLFxuXG4gICAgLy8gQSBwYXRoIHRvIGEgbW9kdWxlIHdoaWNoIGV4cG9ydHMgYW4gYXN5bmMgZnVuY3Rpb24gdGhhdCBpcyB0cmlnZ2VyZWQgb25jZSBhZnRlciBhbGwgdGVzdCBzdWl0ZXNcbiAgICAvLyBnbG9iYWxUZWFyZG93bjogdW5kZWZpbmVkLFxuXG4gICAgLy8gQSBzZXQgb2YgZ2xvYmFsIHZhcmlhYmxlcyB0aGF0IG5lZWQgdG8gYmUgYXZhaWxhYmxlIGluIGFsbCB0ZXN0IGVudmlyb25tZW50c1xuICAgIC8vIGdsb2JhbHM6IHt9LFxuXG4gICAgLy8gVGhlIG1heGltdW0gYW1vdW50IG9mIHdvcmtlcnMgdXNlZCB0byBydW4geW91ciB0ZXN0cy4gQ2FuIGJlIHNwZWNpZmllZCBhcyAlIG9yIGEgbnVtYmVyLiBFLmcuIG1heFdvcmtlcnM6IDEwJSB3aWxsIHVzZSAxMCUgb2YgeW91ciBDUFUgYW1vdW50ICsgMSBhcyB0aGUgbWF4aW11bSB3b3JrZXIgbnVtYmVyLiBtYXhXb3JrZXJzOiAyIHdpbGwgdXNlIGEgbWF4aW11bSBvZiAyIHdvcmtlcnMuXG4gICAgLy8gbWF4V29ya2VyczogXCI1MCVcIixcblxuICAgIC8vIEFuIGFycmF5IG9mIGRpcmVjdG9yeSBuYW1lcyB0byBiZSBzZWFyY2hlZCByZWN1cnNpdmVseSB1cCBmcm9tIHRoZSByZXF1aXJpbmcgbW9kdWxlJ3MgbG9jYXRpb25cbiAgICAvLyBtb2R1bGVEaXJlY3RvcmllczogW1xuICAgIC8vICAgXCJub2RlX21vZHVsZXNcIlxuICAgIC8vIF0sXG5cbiAgICAvLyBBbiBhcnJheSBvZiBmaWxlIGV4dGVuc2lvbnMgeW91ciBtb2R1bGVzIHVzZVxuICAgIC8vIG1vZHVsZUZpbGVFeHRlbnNpb25zOiBbXG4gICAgLy8gICBcImpzXCIsXG4gICAgLy8gICBcIm1qc1wiLFxuICAgIC8vICAgXCJjanNcIixcbiAgICAvLyAgIFwianN4XCIsXG4gICAgLy8gICBcInRzXCIsXG4gICAgLy8gICBcInRzeFwiLFxuICAgIC8vICAgXCJqc29uXCIsXG4gICAgLy8gICBcIm5vZGVcIlxuICAgIC8vIF0sXG5cbiAgICAvLyBBIG1hcCBmcm9tIHJlZ3VsYXIgZXhwcmVzc2lvbnMgdG8gbW9kdWxlIG5hbWVzIG9yIHRvIGFycmF5cyBvZiBtb2R1bGUgbmFtZXMgdGhhdCBhbGxvdyB0byBzdHViIG91dCByZXNvdXJjZXMgd2l0aCBhIHNpbmdsZSBtb2R1bGVcbiAgICAvLyBtb2R1bGVOYW1lTWFwcGVyOiB7fSxcblxuICAgIC8vIEFuIGFycmF5IG9mIHJlZ2V4cCBwYXR0ZXJuIHN0cmluZ3MsIG1hdGNoZWQgYWdhaW5zdCBhbGwgbW9kdWxlIHBhdGhzIGJlZm9yZSBjb25zaWRlcmVkICd2aXNpYmxlJyB0byB0aGUgbW9kdWxlIGxvYWRlclxuICAgIC8vIG1vZHVsZVBhdGhJZ25vcmVQYXR0ZXJuczogW10sXG5cbiAgICAvLyBBY3RpdmF0ZXMgbm90aWZpY2F0aW9ucyBmb3IgdGVzdCByZXN1bHRzXG4gICAgLy8gbm90aWZ5OiBmYWxzZSxcblxuICAgIC8vIEFuIGVudW0gdGhhdCBzcGVjaWZpZXMgbm90aWZpY2F0aW9uIG1vZGUuIFJlcXVpcmVzIHsgbm90aWZ5OiB0cnVlIH1cbiAgICAvLyBub3RpZnlNb2RlOiBcImZhaWx1cmUtY2hhbmdlXCIsXG5cbiAgICAvLyBBIHByZXNldCB0aGF0IGlzIHVzZWQgYXMgYSBiYXNlIGZvciBKZXN0J3MgY29uZmlndXJhdGlvblxuICAgIHByZXNldDogJ3RzLWplc3QnLFxuXG4gICAgLy8gUnVuIHRlc3RzIGZyb20gb25lIG9yIG1vcmUgcHJvamVjdHNcbiAgICAvLyBwcm9qZWN0czogdW5kZWZpbmVkLFxuXG4gICAgLy8gVXNlIHRoaXMgY29uZmlndXJhdGlvbiBvcHRpb24gdG8gYWRkIGN1c3RvbSByZXBvcnRlcnMgdG8gSmVzdFxuICAgIC8vIHJlcG9ydGVyczogdW5kZWZpbmVkLFxuXG4gICAgLy8gQXV0b21hdGljYWxseSByZXNldCBtb2NrIHN0YXRlIGJlZm9yZSBldmVyeSB0ZXN0XG4gICAgLy8gcmVzZXRNb2NrczogZmFsc2UsXG5cbiAgICAvLyBSZXNldCB0aGUgbW9kdWxlIHJlZ2lzdHJ5IGJlZm9yZSBydW5uaW5nIGVhY2ggaW5kaXZpZHVhbCB0ZXN0XG4gICAgLy8gcmVzZXRNb2R1bGVzOiBmYWxzZSxcblxuICAgIC8vIEEgcGF0aCB0byBhIGN1c3RvbSByZXNvbHZlclxuICAgIC8vIHJlc29sdmVyOiB1bmRlZmluZWQsXG5cbiAgICAvLyBBdXRvbWF0aWNhbGx5IHJlc3RvcmUgbW9jayBzdGF0ZSBhbmQgaW1wbGVtZW50YXRpb24gYmVmb3JlIGV2ZXJ5IHRlc3RcbiAgICAvLyByZXN0b3JlTW9ja3M6IGZhbHNlLFxuXG4gICAgLy8gVGhlIHJvb3QgZGlyZWN0b3J5IHRoYXQgSmVzdCBzaG91bGQgc2NhbiBmb3IgdGVzdHMgYW5kIG1vZHVsZXMgd2l0aGluXG4gICAgLy8gcm9vdERpcjogdW5kZWZpbmVkLFxuXG4gICAgLy8gQSBsaXN0IG9mIHBhdGhzIHRvIGRpcmVjdG9yaWVzIHRoYXQgSmVzdCBzaG91bGQgdXNlIHRvIHNlYXJjaCBmb3IgZmlsZXMgaW5cbiAgICAvLyByb290czogW1xuICAgIC8vICAgXCI8cm9vdERpcj5cIlxuICAgIC8vIF0sXG5cbiAgICAvLyBBbGxvd3MgeW91IHRvIHVzZSBhIGN1c3RvbSBydW5uZXIgaW5zdGVhZCBvZiBKZXN0J3MgZGVmYXVsdCB0ZXN0IHJ1bm5lclxuICAgIC8vIHJ1bm5lcjogXCJqZXN0LXJ1bm5lclwiLFxuXG4gICAgLy8gVGhlIHBhdGhzIHRvIG1vZHVsZXMgdGhhdCBydW4gc29tZSBjb2RlIHRvIGNvbmZpZ3VyZSBvciBzZXQgdXAgdGhlIHRlc3RpbmcgZW52aXJvbm1lbnQgYmVmb3JlIGVhY2ggdGVzdFxuICAgIC8vIHNldHVwRmlsZXM6IFtdLFxuXG4gICAgLy8gQSBsaXN0IG9mIHBhdGhzIHRvIG1vZHVsZXMgdGhhdCBydW4gc29tZSBjb2RlIHRvIGNvbmZpZ3VyZSBvciBzZXQgdXAgdGhlIHRlc3RpbmcgZnJhbWV3b3JrIGJlZm9yZSBlYWNoIHRlc3RcbiAgICAvLyBzZXR1cEZpbGVzQWZ0ZXJFbnY6IFtdLFxuXG4gICAgLy8gVGhlIG51bWJlciBvZiBzZWNvbmRzIGFmdGVyIHdoaWNoIGEgdGVzdCBpcyBjb25zaWRlcmVkIGFzIHNsb3cgYW5kIHJlcG9ydGVkIGFzIHN1Y2ggaW4gdGhlIHJlc3VsdHMuXG4gICAgLy8gc2xvd1Rlc3RUaHJlc2hvbGQ6IDUsXG5cbiAgICAvLyBBIGxpc3Qgb2YgcGF0aHMgdG8gc25hcHNob3Qgc2VyaWFsaXplciBtb2R1bGVzIEplc3Qgc2hvdWxkIHVzZSBmb3Igc25hcHNob3QgdGVzdGluZ1xuICAgIC8vIHNuYXBzaG90U2VyaWFsaXplcnM6IFtdLFxuXG4gICAgLy8gVGhlIHRlc3QgZW52aXJvbm1lbnQgdGhhdCB3aWxsIGJlIHVzZWQgZm9yIHRlc3RpbmdcbiAgICB0ZXN0RW52aXJvbm1lbnQ6IFwibm9kZVwiLFxuXG4gICAgLy8gT3B0aW9ucyB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIHRoZSB0ZXN0RW52aXJvbm1lbnRcbiAgICAvLyB0ZXN0RW52aXJvbm1lbnRPcHRpb25zOiB7fSxcblxuICAgIC8vIEFkZHMgYSBsb2NhdGlvbiBmaWVsZCB0byB0ZXN0IHJlc3VsdHNcbiAgICAvLyB0ZXN0TG9jYXRpb25JblJlc3VsdHM6IGZhbHNlLFxuXG4gICAgLy8gVGhlIGdsb2IgcGF0dGVybnMgSmVzdCB1c2VzIHRvIGRldGVjdCB0ZXN0IGZpbGVzXG4gICAgLy8gdGVzdE1hdGNoOiBbXG4gICAgLy8gICBcIioqL19fdGVzdHNfXy8qKi8qLltqdF1zPyh4KVwiLFxuICAgIC8vICAgXCIqKi8/KCouKSsoc3BlY3x0ZXN0KS5bdGpdcz8oeClcIlxuICAgIC8vIF0sXG5cbiAgICAvLyBBbiBhcnJheSBvZiByZWdleHAgcGF0dGVybiBzdHJpbmdzIHRoYXQgYXJlIG1hdGNoZWQgYWdhaW5zdCBhbGwgdGVzdCBwYXRocywgbWF0Y2hlZCB0ZXN0cyBhcmUgc2tpcHBlZFxuICAgIC8vIHRlc3RQYXRoSWdub3JlUGF0dGVybnM6IFtcbiAgICAvLyAgIFwiL25vZGVfbW9kdWxlcy9cIlxuICAgIC8vIF0sXG5cbiAgICAvLyBUaGUgcmVnZXhwIHBhdHRlcm4gb3IgYXJyYXkgb2YgcGF0dGVybnMgdGhhdCBKZXN0IHVzZXMgdG8gZGV0ZWN0IHRlc3QgZmlsZXNcbiAgICAvLyB0ZXN0UmVnZXg6IFtdLFxuXG4gICAgLy8gVGhpcyBvcHRpb24gYWxsb3dzIHRoZSB1c2Ugb2YgYSBjdXN0b20gcmVzdWx0cyBwcm9jZXNzb3JcbiAgICAvLyB0ZXN0UmVzdWx0c1Byb2Nlc3NvcjogdW5kZWZpbmVkLFxuXG4gICAgLy8gVGhpcyBvcHRpb24gYWxsb3dzIHVzZSBvZiBhIGN1c3RvbSB0ZXN0IHJ1bm5lclxuICAgIC8vIHRlc3RSdW5uZXI6IFwiamVzdC1jaXJjdXMvcnVubmVyXCIsXG5cbiAgICAvLyBBIG1hcCBmcm9tIHJlZ3VsYXIgZXhwcmVzc2lvbnMgdG8gcGF0aHMgdG8gdHJhbnNmb3JtZXJzXG4gICAgLy8gdHJhbnNmb3JtOiB1bmRlZmluZWQsXG5cbiAgICAvLyBBbiBhcnJheSBvZiByZWdleHAgcGF0dGVybiBzdHJpbmdzIHRoYXQgYXJlIG1hdGNoZWQgYWdhaW5zdCBhbGwgc291cmNlIGZpbGUgcGF0aHMsIG1hdGNoZWQgZmlsZXMgd2lsbCBza2lwIHRyYW5zZm9ybWF0aW9uXG4gICAgLy8gdHJhbnNmb3JtSWdub3JlUGF0dGVybnM6IFtcbiAgICAvLyAgIFwiL25vZGVfbW9kdWxlcy9cIixcbiAgICAvLyAgIFwiXFxcXC5wbnBcXFxcLlteXFxcXC9dKyRcIlxuICAgIC8vIF0sXG5cbiAgICAvLyBBbiBhcnJheSBvZiByZWdleHAgcGF0dGVybiBzdHJpbmdzIHRoYXQgYXJlIG1hdGNoZWQgYWdhaW5zdCBhbGwgbW9kdWxlcyBiZWZvcmUgdGhlIG1vZHVsZSBsb2FkZXIgd2lsbCBhdXRvbWF0aWNhbGx5IHJldHVybiBhIG1vY2sgZm9yIHRoZW1cbiAgICAvLyB1bm1vY2tlZE1vZHVsZVBhdGhQYXR0ZXJuczogdW5kZWZpbmVkLFxuXG4gICAgLy8gSW5kaWNhdGVzIHdoZXRoZXIgZWFjaCBpbmRpdmlkdWFsIHRlc3Qgc2hvdWxkIGJlIHJlcG9ydGVkIGR1cmluZyB0aGUgcnVuXG4gICAgLy8gdmVyYm9zZTogdW5kZWZpbmVkLFxuXG4gICAgLy8gQW4gYXJyYXkgb2YgcmVnZXhwIHBhdHRlcm5zIHRoYXQgYXJlIG1hdGNoZWQgYWdhaW5zdCBhbGwgc291cmNlIGZpbGUgcGF0aHMgYmVmb3JlIHJlLXJ1bm5pbmcgdGVzdHMgaW4gd2F0Y2ggbW9kZVxuICAgIC8vIHdhdGNoUGF0aElnbm9yZVBhdHRlcm5zOiBbXSxcblxuICAgIC8vIFdoZXRoZXIgdG8gdXNlIHdhdGNobWFuIGZvciBmaWxlIGNyYXdsaW5nXG4gICAgLy8gd2F0Y2htYW46IHRydWUsXG59O1xuIl19