import {spawnSync} from 'child_process';
import fs from 'fs';
import path from 'path';

import generateMessages from '@cucumber/gherkin/dist/src/stream/generateMessages';
import {uuid} from '@cucumber/messages/dist/src/IdGenerator';
import AsciiTable from 'ascii-table';
import chalk from 'chalk';
import DataTable from 'cucumber/lib/models/data_table';
import {default as supportCodeLibraryBuilder} from 'cucumber/lib/support_code_library_builder';
import escapeStringRegexp from 'escape-string-regexp';
import {flattenObject} from 'flatten-anything';
import {interopRequireDefault} from 'jest-util';

import * as env from '../env';
import getMocks from './getMocks';

supportCodeLibraryBuilder.finalize();

const space = '      ';

function createDataTable(rows) {
    const table = new AsciiTable();

    table.setHeading(...rows[0]);

    for (let i = 1; i < rows.length; i++) {
        table.addRow(...rows[i]);
    }

    return table
        .toString()
        .split('\n')
        .map((row) => space + row)
        .join('\n');
}

function parseFeature(cwd: string, featurePath: string, extensions: string[]) {
    const source = fs.readFileSync(featurePath, 'utf8');

    const varMapExts = extensions.filter((ext) => ext !== 'feature');

    const fileExtension = path.extname(featurePath);
    const isJSON = fileExtension === 'json';

    const varMapPathsForEnv = JSON.parse(
        spawnSync(
            'node',
            [
                path.normalize(path.resolve(__dirname, './getPaths.js')),
                cwd,
                path.join(
                    '**',
                    `${path.basename(featurePath, fileExtension)}.${
                        env.ENV_NAME
                    }.vars`
                ),
                JSON.stringify(varMapExts)
            ],
            {
                encoding: 'utf-8'
            }
        ).stdout
    );
    // scan relative directories to find any file that matches the feature file name,
    // but as another extension
    const varMapPaths = JSON.parse(
        spawnSync(
            'node',
            [
                path.normalize(path.resolve(__dirname, './getPaths.js')),
                cwd,
                path.join(
                    '**',
                    `${path.basename(featurePath, fileExtension)}.vars`
                ),
                JSON.stringify(varMapExts)
            ],
            {
                encoding: 'utf-8'
            }
        ).stdout
    );

    if (!varMapPaths.length && !varMapPathsForEnv.length) {
        return featurePath;
    }

    const varMapLocation = (varMapPaths.length
        ? varMapPaths
        : varMapPathsForEnv
    ).filter((path) => !path.includes('node_modules'))[0];

    // load the variable file; use default if it's not a json file
    const varMapFile = varMapLocation
        ? ((isJSON
              ? interopRequireDefault(require(varMapLocation))
              : interopRequireDefault(require(varMapLocation)).default) as {
              [name: string]: string | boolean | Date | number;
          })
        : null;

    // create a flattened structure, eg:
    // { 'foo.bar': 123, 'can[1]': 2 }
    const variables = flattenObject(varMapFile);

    // interpolate the feature file with the varMapFile
    const tmpSource = variables
        ? Object.entries(variables).reduce(
              (acc, [key, value]) =>
                  acc.replace(
                      new RegExp('\\$' + escapeStringRegexp(key), 'g'),
                      value.toString()
                  ),
              source + ''
          )
        : source;

    const tmpPath = path.normalize(
        path.resolve(path.join(cwd, path.join('node_modules', '.tmp')))
    );

    const featureSourcePath =
        tmpSource !== source
            ? path.normalize(path.resolve(tmpPath, path.basename(featurePath)))
            : featurePath;

    if (tmpSource !== source) {
        if (!fs.existsSync(tmpPath)) {
            fs.mkdirSync(tmpPath);
        }

        if (fs.existsSync(featureSourcePath)) {
            fs.unlinkSync(featureSourcePath);
        }

        // write the temp feature file to tmp directory
        fs.writeFileSync(featureSourcePath, tmpSource);

        return featureSourcePath;
    }

    return featurePath;
}

function parseGherkinExampleTables(examples) {
    return (examples || []).reduce((acc, example) => {
        const keys = example.tableHeader.cells.reduce(
            (acc, cell) => [...acc, cell.value],
            []
        );

        return [
            ...acc,
            ...example.tableBody.reduce(
                (acc, row) => [
                    ...acc,
                    keys.reduce(
                        (acc, key, i) => [
                            ...acc,
                            {
                                key,
                                value: row.cells[i].value
                            }
                        ],
                        []
                    )
                ],
                []
            )
        ];
    }, []);
}

function parseGherkinVariables(example, text) {
    return example.reduce((acc, variable) => {
        return acc.replace(new RegExp(`<${variable.key}>`), variable.value);
    }, text + '');
}

function generateExampleTableSteps(examples, scenario) {
    return examples.reduce(
        (acc, example) => [
            ...acc,
            {
                ...scenario,
                name: parseGherkinVariables(example, scenario.name),
                steps: scenario.steps.map((step) => ({
                    ...step,
                    ...(step.docString
                        ? {
                              docString: {
                                  ...step.docString,
                                  content: parseGherkinVariables(
                                      example,
                                      step.docString.content
                                  )
                              }
                          }
                        : {}),
                    text: parseGherkinVariables(example, step.text)
                }))
            }
        ],
        []
    );
}

function isJson(text): boolean {
    try {
        JSON.parse(text);
        return true;
    } catch (e) {
        return false;
    }
}

function bindGherkinSteps(steps, definitions) {
    return steps.reduce(
        (acc, step) => {
            const definition = definitions.find((def) => {
                return def.matchesStepName(step.text);
            });

            const multiSteps = definitions.filter((def) => {
                return def.matchesStepName(step.text);
            });

            if (!definition) {
                throw new Error(
                    `\n${chalk.red(
                        'Error:'
                    )}\nCould not find a step with pattern that matches the text:\n${chalk.yellow(
                        step.text
                    )}\n`
                );
            }

            if (multiSteps.length > 1) {
                process.stdout.write(
                    `${chalk.yellow(
                        'Warning:'
                    )}\nmultiple steps found\nstep:${chalk.yellow(
                        step.text
                    )}\npatterns:\n${multiSteps
                        .map((step) => `- ${step.pattern.toString()}`)
                        .join('\n')}\n`
                );
            }

            const args = Array.from(
                definition.expression?.regexp?.exec(step.text) || []
            ).slice(1);

            const stepArgs = [
                ...args,
                ...(step.dataTable ? [new DataTable(step.dataTable)] : []),
                ...(step.docString
                    ? [
                          isJson(step.docString.content)
                              ? JSON.parse(step.docString.content)
                              : step.docString.content
                      ]
                    : [])
            ];

            const type = (step.keyword || '').trim().toLowerCase();

            if (acc.last !== type && type !== 'and' && type !== 'but') {
                acc.last = type;
            }

            const tableDescription = step.dataTable
                ? '\n' + createDataTable(stepArgs[stepArgs.length - 1].rawTable)
                : '';

            const docStringDescription = step.docString
                ? '\n' +
                  step.docString.content
                      .split('\n')
                      .map((row) => space + `${row}`)
                      .join('\n')
                : '';

            return {
                ...acc,
                [acc.last]: [
                    ...(acc[acc.last] || []),
                    {
                        description: `${step.keyword}${step.text}${tableDescription}${docStringDescription}`,
                        ...step,
                        code: definition.code,
                        stepArgs
                    }
                ]
            };
        },
        {
            last: 'given',
            given: [],
            when: [],
            then: []
        }
    );
}

function includeTag(tagRaw) {
    const tag = tagRaw.replace('@', '');

    if (tag === 'skip') {
        return false;
    }

    if (tag === 'debug') {
        return true;
    }

    if (env.TAGS.length === 0) {
        return true;
    }

    const hasExcludes = env.EXCLUDE_TAGS.length > 0;
    const hasIncludes = env.INCLUDE_TAGS.length > 0;

    const isIncluded = hasIncludes && env.INCLUDE_TAGS.includes(tag);
    const isExcluded = hasExcludes && env.EXCLUDE_TAGS.includes(tag);

    return isExcluded ? false : !hasIncludes || isIncluded;
}

function parseGherkinSuites(
    cwd,
    feature: string,
    extensions: string[],
    cucumberSupportCode: any
) {
    const featurePath = parseFeature(cwd, feature, extensions);

    const source = fs.readFileSync(featurePath, 'utf8');

    const events = generateMessages(
        source,
        path.normalize(path.relative(cwd, featurePath)),
        {
            includeSource: false,
            includeGherkinDocument: true,
            includePickles: true,
            newId: uuid()
        }
    );

    const document = events[0].gherkinDocument.feature;
    const hasBackground = !!document.children[0].background;
    const specs = hasBackground
        ? document.children.slice(1)
        : document.children;

    const hasExcludeTags = env.EXCLUDE_TAGS.length > 0;
    const hasTags = env.TAGS.length > 0;

    const documentTags = document.tags.map(({name}) => name);
    const documentHasTags =
        documentTags.length > 0 && documentTags.some(includeTag);
    const shouldSkipFeature = documentTags.includes('@skip');

    const documentContainsSpecsWithTags = specs.some(
        (spec) =>
            spec.scenario.tags.length &&
            spec.scenario.tags.some(({name}) => includeTag(name))
    );

    const scenarioTags = specs.reduce(
        (acc, spec) => [...acc, ...spec.scenario.tags.map(({name}) => name)],
        []
    );

    const documentHasDebugTag = scenarioTags.includes('@debug');

    const scenarios = specs.reduce((acc, spec) => {
        const tags = spec.scenario.tags.map(({name}) => name);

        const examples = parseGherkinExampleTables(spec.scenario.examples);

        const shouldSkipForDebug =
            documentHasDebugTag && !tags.includes('@debug');

        const skip =
            shouldSkipForDebug ||
            tags.includes('@skip') ||
            (hasTags && !!tags.length && !tags.some(includeTag));

        return [
            ...acc,
            ...(examples.length
                ? generateExampleTableSteps(examples, spec.scenario).map(
                      (spec) => ({
                          ...spec,
                          skip
                      })
                  )
                : [
                      {
                          ...spec.scenario,
                          skip,
                          steps: spec.scenario.steps
                      }
                  ])
        ];
    }, []);

    const skipFeature =
        shouldSkipFeature ||
        (hasTags &&
            !documentHasTags &&
            !documentContainsSpecsWithTags &&
            !hasExcludeTags) ||
        scenarios.length === 0;

    const suites = scenarios.map((scenario) => ({
        ...scenario,
        path: featurePath,
        steps: [
            ...(hasBackground ? document.children[0].background.steps : []),
            ...scenario.steps
        ]
    }));

    return {
        document,
        afterEach: cucumberSupportCode.afterTestCaseHookDefinitions,
        afterAll: cucumberSupportCode.afterTestRunHookDefinitions,
        beforeEach: cucumberSupportCode.beforeTestCaseHookDefinitions,
        beforeAll: cucumberSupportCode.beforeTestRunHookDefinitions,
        skip: skipFeature,
        suites: suites.map((suite) => ({
            ...suite,
            steps: bindGherkinSteps(
                suite.steps,
                cucumberSupportCode.stepDefinitions
            )
        }))
    };
}

export default function execTest(
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
    const spec = parseGherkinSuites(
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
