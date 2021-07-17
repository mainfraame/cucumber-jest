import path from 'path';

import supportCodeLibraryBuilder from '@cucumber/cucumber/lib/support_code_library_builder';

import {parseSuite} from './parsers/suite';

const options = supportCodeLibraryBuilder.finalize();

let hasReactDom = false;

/** check if react exists */
try {
    hasReactDom = !!require('react-dom');
} catch (e) {
    //
}

export function exec(
    cwd: string,
    featurePath: string,
    moduleFileExtensions: string[]
) {
    const act =
        typeof global['window'] === 'undefined' || !hasReactDom
            ? async (fn) => await fn()
            : require('react-dom/test-utils').act;

    // parse the feature file with given cucumber steps / hooks
    // generating a jasmine-like structure
    const spec = parseSuite(cwd, featurePath, moduleFileExtensions, options);

    const fileName = path.basename(featurePath, path.extname(featurePath));

    const hasSomeActiveSuites = spec.suites.some((suite) => !suite.skip);

    const shouldSkipSuite = spec.skip || !hasSomeActiveSuites;

    const fn = shouldSkipSuite ? xdescribe || describe.skip : describe;

    fn(`Feature: ${spec.document.name}`, () => {
        let world;

        beforeAll(async () => {
            world = new options.World({});

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
