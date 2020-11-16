import generateMessages from '@cucumber/gherkin/dist/src/stream/generateMessages';
import { uuid } from '@cucumber/messages/dist/src/IdGenerator';
import { spawnSync } from 'child_process';
import DataTable from 'cucumber/lib/models/data_table';
import { default as supportCodeLibraryBuilder } from 'cucumber/lib/support_code_library_builder';
import { interopRequireDefault } from 'jest-util';
import fs from 'fs';
import path from 'path';

supportCodeLibraryBuilder.finalize();

function parseFeature(cwd: string, featurePath: string, extensions: string[]) {

    const source = fs.readFileSync(featurePath, 'utf8');

    const varMapExts = extensions.filter((ext) => ext !== 'feature');

    const varMapFileName = process.env.CUCUMBER_ENV ?
        `**/${path.basename(featurePath, path.extname(featurePath))}.${process.env.CUCUMBER_ENV}.vars` :
        `**/${path.basename(featurePath, path.extname(featurePath))}.vars`;

    // scan relative directories to find any file that matches the feature file name,
    // but as another extension
    const varMapPaths = spawnSync(
        'node',
        [
            path.resolve(__dirname, './getPaths.js'),
            cwd,
            varMapFileName,
            JSON.stringify(varMapExts)
        ],
        {
            encoding: 'utf-8'
        }
    ).stdout;

    if (!varMapPaths) {
        return featurePath;
    }

    const varMapLocation = JSON.parse(varMapPaths)[0];

    // load the var map file
    const varMapFile = varMapLocation ?
        interopRequireDefault(require(varMapLocation)).default as { [name: string]: string | boolean | Date | number } :
        null;

    // interpolate the feature file with the varMapFile
    const tmpSource = varMapFile ?
        Object.entries(varMapFile).reduce((acc, [key, value]) => (
            acc.replace(new RegExp('\\$' + key, 'g'), value.toString())
        ), source + '') :
        source;

    const tmpPath = path.resolve(cwd, './node_modules/.tmp');

    const featureSourcePath = tmpSource !== source ?
        path.resolve(tmpPath, path.basename(featurePath)) :
        featurePath;

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
    return (examples || [])
        .reduce((acc, example) => {

            const keys = example.tableHeader.cells
                .reduce((acc, cell) => ([...acc, cell.value]), []);

            return [
                ...acc,
                ...example.tableBody
                    .reduce((acc, row) => ([
                        ...acc,
                        keys.reduce((acc, key, i) => ([
                            ...acc,
                            {
                                key,
                                value: row.cells[i].value
                            }
                        ]), [])
                    ]), [])
            ];
        }, []);
}

function parseGherkinVariables(example, text) {
    return example.reduce((acc, variable) => {
        return acc.replace(new RegExp(`<${variable.key}>`), variable.value);
    }, text + '');
}

function generateExampleTableSteps(examples, scenario) {
    return examples.reduce((acc, example) => ([
        ...acc,
        {
            ...scenario,
            name: parseGherkinVariables(example, scenario.name),
            steps: scenario.steps.map((step) => ({
                ...step,
                ...step.docString ? {
                    docString: {
                        ...step.docString,
                        content: parseGherkinVariables(example, step.docString.content)
                    }
                } : {},
                text: parseGherkinVariables(example, step.text)
            }))
        }
    ]), []);
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

    return steps.reduce((acc, step) => {

        const definition = definitions.find((def) => {
            return def.matchesStepName(step.text);
        });

        const args = definition.pattern ?
            Array.from(definition.pattern.exec(step.text)).slice(1) :
            [];

        const stepArgs = [
            ...args,
            ...step.dataTable ?
                [new DataTable(step.dataTable)] :
                [],
            ...step.docString ?
                [isJson(step.docString.content) ? JSON.parse(step.docString.content) : step.docString.content] :
                []
        ];

        const type = (step.keyword || '').trim().toLowerCase();

        if (acc.last !== type && type !== 'and' && type !== 'but') {
            acc.last = type;
        }

        const tableDescription = step.dataTable ?
            '\n' + stepArgs[0].rawTable.reduce((acc, row) => ([
                ...acc,
                row.join(' | ')
            ]), []).join('\n') : '';

        const docStringDescription = step.docString ?
            '\n' + step.docString.content : '';

        return {
            ...acc,
            [acc.last]: [
                ...acc[acc.last] || [],
                {
                    description: `${step.keyword}${step.text}${tableDescription}${docStringDescription}`,
                    ...step,
                    code: definition.code,
                    stepArgs
                }
            ]
        };
    }, {
        last: 'given',
        given: [],
        when: [],
        then: []
    });
}

function parseGherkinSuites(cwd, feature: string, extensions: string[], cucumberSupportCode: any) {

    const featurePath = parseFeature(cwd, feature, extensions);

    const source = fs.readFileSync(featurePath, 'utf8');

    const events = generateMessages(source, path.relative(cwd, featurePath), {
        includeSource: false,
        includeGherkinDocument: true,
        includePickles: true,
        newId: uuid()
    });

    const document = events[0].gherkinDocument.feature;
    const hasBackground = !!document.children[0].background;
    const specs = hasBackground ? document.children.slice(1) : document.children;

    const scenarios = specs.reduce((acc, spec) => {

        const examples = parseGherkinExampleTables(spec.scenario.examples);

        return [
            ...acc,
            ...examples.length ?
                generateExampleTableSteps(examples, spec.scenario) :
                [
                    {
                        ...spec.scenario,
                        steps: spec.scenario.steps
                    }
                ]
        ];
    }, []);

    const suites = scenarios.map((scenario) => ({
        ...scenario,
        path: featurePath,
        steps: [
            ...hasBackground ? document.children[0].background.steps : [],
            ...scenario.steps
        ]
    }));

    return {
        document,
        afterEach: cucumberSupportCode.afterTestCaseHookDefinitions,
        afterAll: cucumberSupportCode.afterTestRunHookDefinitions,
        beforeEach: cucumberSupportCode.beforeTestCaseHookDefinitions,
        beforeAll: cucumberSupportCode.beforeTestRunHookDefinitions,
        suites: suites.map((suite) => ({
            ...suite,
            steps: bindGherkinSteps(
                suite.steps,
                cucumberSupportCode.stepDefinitions
            )
        }))
    };
}

export default function execTest(cwd: string, featurePath: string, moduleFileExtensions: string[]) {

    const act = typeof global['window'] === 'undefined' ?
        async (fn) => await fn() :
        require('react-dom/test-utils').act;

    // parse the feature file with given cucumber steps / hooks
    // generating a jasmine-like structure
    const spec = parseGherkinSuites(
        cwd,
        featurePath,
        moduleFileExtensions,
        supportCodeLibraryBuilder.options
    );

    const fileName = path.basename(featurePath, path.extname(featurePath));

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

    if (process.env.JEST_RETRY_TIMES) {
        jest.retryTimes(+process.env.JEST_RETRY_TIMES);
    }

    spec.suites.forEach((suite) => {

        describe(spec.document.keyword + ': ' + spec.document.name + ' - ' + suite.name, () => {

            beforeAll(async () => {
                for (let i = 0; i < spec.beforeEach.length; i++) {
                    await act(async () => {
                        await spec.beforeEach[i].code.apply(world, [{spec, suite: suite}, fileName]);
                    });
                }
            });

            afterAll(async () => {
                for (let i = 0; i < spec.afterEach.length; i++) {
                    await act(async () => {
                        await spec.afterEach[i].code.apply(world, [{spec, suite: suite}, fileName]);
                    });
                }
            });

            for (let i = 0; i < suite.steps.given.length; i++) {
                it(suite.steps.given[i].keyword + suite.steps.given[i].text, async () => {
                    await suite.steps.given[i].code.apply(world, suite.steps.given[i].stepArgs);
                });
            }

            for (let i = 0; i < suite.steps.when.length; i++) {
                it(suite.steps.when[i].description, async () => {
                    await suite.steps.when[i].code.apply(world, suite.steps.when[i].stepArgs);
                });
            }

            for (let i = 0; i < suite.steps.then.length; i++) {
                it(suite.steps.then[i].description, async () => {
                    await suite.steps.then[i].code.apply(world, suite.steps.then[i].stepArgs);
                });
            }
        });
    });

}
