"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = execTest;

var _generateMessages = _interopRequireDefault(require("@cucumber/gherkin/dist/src/stream/generateMessages"));

var _IdGenerator = require("@cucumber/messages/dist/src/IdGenerator");

var _child_process = require("child_process");

var _data_table = _interopRequireDefault(require("cucumber/lib/models/data_table"));

var _support_code_library_builder = _interopRequireDefault(require("cucumber/lib/support_code_library_builder"));

var _jestUtil = require("jest-util");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_support_code_library_builder.default.finalize();

function parseFeature(cwd, featurePath, extensions) {
  const source = _fs.default.readFileSync(featurePath, 'utf8');

  const varMapExts = extensions.filter(ext => ext !== 'feature');
  const varMapFileName = process.env.CUCUMBER_ENV ? `**/${_path.default.basename(featurePath, _path.default.extname(featurePath))}.${process.env.CUCUMBER_ENV}.vars` : `**/${_path.default.basename(featurePath, _path.default.extname(featurePath))}.vars`; // scan relative directories to find any file that matches the feature file name,
  // but as another extension

  const varMapPaths = (0, _child_process.spawnSync)('node', [_path.default.resolve(process.cwd(), './node_modules/cucumber-jest/dist/getPaths.js'), cwd, varMapFileName, JSON.stringify(varMapExts)], {
    encoding: 'utf-8'
  }).stdout;
  const varMapLocation = JSON.parse(varMapPaths)[0]; // load the var map file

  const varMapFile = varMapLocation ? (0, _jestUtil.interopRequireDefault)(require(varMapLocation)).default : null; // interpolate the feature file with the varMapFile

  const tmpSource = varMapFile ? Object.entries(varMapFile).reduce((acc, [key, value]) => acc.replace(new RegExp('\\$' + key, 'g'), value.toString()), source + '') : source;

  const tmpPath = _path.default.resolve(cwd, './node_modules/.tmp');

  const featureSourcePath = tmpSource !== source ? _path.default.resolve(tmpPath, _path.default.basename(featurePath)) : featurePath;

  if (tmpSource !== source) {
    if (!_fs.default.existsSync(tmpPath)) {
      _fs.default.mkdirSync(tmpPath);
    }

    if (_fs.default.existsSync(featureSourcePath)) {
      _fs.default.unlinkSync(featureSourcePath);
    } // write the temp feature file to tmp directory


    _fs.default.writeFileSync(featureSourcePath, tmpSource);

    return featureSourcePath;
  }

  return featurePath;
}

function parseGherkinExampleTables(examples) {
  return (examples || []).reduce((acc, example) => {
    const keys = example.tableHeader.cells.reduce((acc, cell) => [...acc, cell.value], []);
    return [...acc, ...example.tableBody.reduce((acc, row) => [...acc, keys.reduce((acc, key, i) => [...acc, {
      key,
      value: row.cells[i].value
    }], [])], [])];
  }, []);
}

function parseGherkinVariables(example, text) {
  return example.reduce((acc, variable) => {
    return acc.replace(new RegExp(`<${variable.key}>`), variable.value);
  }, text + '');
}

function generateExampleTableSteps(examples, scenario) {
  return examples.reduce((acc, example) => [...acc, { ...scenario,
    name: parseGherkinVariables(example, scenario.name),
    steps: scenario.steps.map(step => ({ ...step,
      ...(step.docString ? {
        docString: { ...step.docString,
          content: parseGherkinVariables(example, step.docString.content)
        }
      } : {}),
      text: parseGherkinVariables(example, step.text)
    }))
  }], []);
}

function isJson(text) {
  try {
    JSON.parse(text);
    return true;
  } catch (e) {
    return false;
  }
}

function bindGherkinSteps(steps, definitions) {
  return steps.reduce((acc, step) => {
    const definition = definitions.find(def => {
      return def.matchesStepName(step.text);
    });
    const args = definition.pattern ? Array.from(definition.pattern.exec(step.text)).slice(1) : [];
    const stepArgs = [...args, ...(step.dataTable ? [new _data_table.default(step.dataTable)] : []), ...(step.docString ? [isJson(step.docString.content) ? JSON.parse(step.docString.content) : step.docString.content] : [])];
    const type = (step.keyword || '').trim().toLowerCase();

    if (acc.last !== type && type !== 'and' && type !== 'but') {
      acc.last = type;
    }

    return { ...acc,
      [acc.last]: [...(acc[acc.last] || []), {
        description: `${step.keyword}${step.text}`,
        ...step,
        code: definition.code,
        stepArgs
      }]
    };
  }, {
    last: 'given',
    given: [],
    when: [],
    then: []
  });
}

function parseGherkinSuites(cwd, feature, extensions, cucumberSupportCode) {
  const featurePath = parseFeature(cwd, feature, extensions);

  const source = _fs.default.readFileSync(featurePath, 'utf8');

  const events = (0, _generateMessages.default)(source, _path.default.relative(cwd, featurePath), {
    includeSource: false,
    includeGherkinDocument: true,
    includePickles: true,
    newId: (0, _IdGenerator.uuid)()
  });
  const document = events[0].gherkinDocument.feature;
  const hasBackground = !!document.children[0].background;
  const specs = hasBackground ? document.children.slice(1) : document.children;
  const scenarios = specs.reduce((acc, spec) => {
    const examples = parseGherkinExampleTables(spec.scenario.examples);
    return [...acc, ...(examples.length ? generateExampleTableSteps(examples, spec.scenario) : [{ ...spec.scenario,
      steps: spec.scenario.steps
    }])];
  }, []);
  const suites = scenarios.map(scenario => ({ ...scenario,
    path: featurePath,
    steps: [...(hasBackground ? document.children[0].background.steps : []), ...scenario.steps]
  }));
  return {
    document,
    afterEach: cucumberSupportCode.afterTestCaseHookDefinitions,
    afterAll: cucumberSupportCode.afterTestRunHookDefinitions,
    beforeEach: cucumberSupportCode.beforeTestCaseHookDefinitions,
    beforeAll: cucumberSupportCode.beforeTestRunHookDefinitions,
    suites: suites.map(suite => ({ ...suite,
      steps: bindGherkinSteps(suite.steps, cucumberSupportCode.stepDefinitions)
    }))
  };
}

function execTest(cwd, featurePath, moduleFileExtensions) {
  const act = typeof global['window'] === 'undefined' ? async fn => await fn() : require('react-dom/test-utils').act; // parse the feature file with given cucumber steps / hooks
  // generating a jasmine-like structure

  const spec = parseGherkinSuites(cwd, featurePath, moduleFileExtensions, _support_code_library_builder.default.options);

  const fileName = _path.default.basename(featurePath, _path.default.extname(featurePath));

  let world;
  beforeAll(async () => {
    world = new _support_code_library_builder.default.options.World({});

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

  spec.suites.forEach(suite => {
    describe(spec.document.keyword + ': ' + spec.document.name + ' - ' + suite.name, () => {
      beforeAll(async () => {
        for (let i = 0; i < spec.beforeEach.length; i++) {
          await act(async () => {
            await spec.beforeEach[i].code.apply(world, [{
              spec,
              suite: suite
            }, fileName]);
          });
        }
      });
      afterAll(async () => {
        for (let i = 0; i < spec.afterEach.length; i++) {
          await act(async () => {
            await spec.afterEach[i].code.apply(world, [{
              spec,
              suite: suite
            }, fileName]);
          });
        }
      });

      for (let i = 0; i < suite.steps.given.length; i++) {
        it(suite.steps.given[i].keyword + suite.steps.given[i].text, async () => {
          await suite.steps.given[i].code.apply(world, suite.steps.given[i].stepArgs);
        });
      }

      for (let i = 0; i < suite.steps.when.length; i++) {
        it(suite.steps.when[i].keyword + suite.steps.when[i].text, async () => {
          await suite.steps.when[i].code.apply(world, suite.steps.when[i].stepArgs);
        });
      }

      for (let i = 0; i < suite.steps.then.length; i++) {
        it(suite.steps.then[i].keyword + suite.steps.then[i].text, async () => {
          await suite.steps.then[i].code.apply(world, suite.steps.then[i].stepArgs);
        });
      }
    });
  });
}
//# sourceMappingURL=parseFeature.js.map