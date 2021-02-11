import path from 'path';

import {default as supportCodeLibraryBuilder} from 'cucumber/lib/support_code_library_builder';

import {parseSuite} from './parsers/suite';
import {getMocks} from './utils/getMocks';

supportCodeLibraryBuilder.finalize();

export function exec(
    cwd: string,
    featurePath: string,
    moduleFileExtensions: string[],
    restoreMocks: boolean | string,
    keepMocks?: string[]
) {
    const act =
        typeof global['window'] === 'undefined'
            ? async (fn) => await fn()
            : require('react-dom/test-utils').act;

    // if projectConfig.restoreMocks, get all the __mock__ based mocks and remove them
    if (
        typeof restoreMocks === 'string'
            ? restoreMocks === 'true'
            : restoreMocks
    ) {
        getMocks(cwd)
            .filter((file) => !keepMocks.length || !keepMocks.includes(file))
            .forEach((file) => {
                jest.unmock(file);
            });
    }

    // parse the feature file with given cucumber steps / hooks
    // generating a jasmine-like structure
    const spec = parseSuite(
        cwd,
        featurePath,
        moduleFileExtensions,
        supportCodeLibraryBuilder.options
    );

    const fileName = path.basename(featurePath, path.extname(featurePath));

    const hasSomeActiveSuites = spec.suites.some((suite) => !suite.skip);

    const shouldSkipSuite = spec.skip || !hasSomeActiveSuites;

    const fn = shouldSkipSuite ? xdescribe || describe.skip : describe;

    fn(`Feature: ${spec.document.name}`, () => {
        let world;

        beforeAll(async () => {
            world = new supportCodeLibraryBuilder.options.World({});

            for (let i = 0; i < spec.beforeAll.length; i++) {
                await act(async () => {
                    await spec.beforeAll[i].code.apply(world, [spec, fileName]);
                });
            }
        });

        afterAll(async () => {
            for (let i = 0; i < spec.afterAll.length; i++) {
                await act(async () => {
                    await spec.afterAll[i].code.apply(world, [spec, fileName]);
                });
            }

            world = null;
        });

        spec.suites.forEach((suite) => {
            const fn = suite.skip ? xdescribe || describe.skip : describe;

            fn(`${suite.keyword}: ${suite.name}`, () => {
                beforeAll(async () => {
                    for (let i = 0; i < spec.beforeEach.length; i++) {
                        await act(async () => {
                            await spec.beforeEach[i].code.apply(world, [
                                {spec, suite: suite},
                                fileName
                            ]);
                        });
                    }
                });

                afterAll(async () => {
                    for (let i = 0; i < spec.afterEach.length; i++) {
                        await act(async () => {
                            await spec.afterEach[i].code.apply(world, [
                                {spec, suite: suite},
                                fileName
                            ]);
                        });
                    }
                });

                for (let i = 0; i < suite.steps.given.length; i++) {
                    it(
                        suite.steps.given[i].keyword +
                            suite.steps.given[i].text,
                        async () => {
                            await suite.steps.given[i].code.apply(
                                world,
                                suite.steps.given[i].stepArgs
                            );
                        }
                    );
                }

                for (let i = 0; i < suite.steps.when.length; i++) {
                    it(suite.steps.when[i].description, async () => {
                        await suite.steps.when[i].code.apply(
                            world,
                            suite.steps.when[i].stepArgs
                        );
                    });
                }

                for (let i = 0; i < suite.steps.then.length; i++) {
                    it(suite.steps.then[i].description, async () => {
                        await suite.steps.then[i].code.apply(
                            world,
                            suite.steps.then[i].stepArgs
                        );
                    });
                }
            });
        });
    });
}