"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _core = require("@babel/core");

var _babelPresetJest = _interopRequireDefault(require("babel-preset-jest"));

var _crypto = _interopRequireDefault(require("crypto"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  canInstrument: false,
  getCacheKey: (fileData, filename, configString, {
    instrument
  }) => _crypto.default.createHash('md5').update('\0', 'utf8').update(fileData).update('\0', 'utf8').update(filename).update('\0', 'utf8').update(configString).update('\0', 'utf8').update('\0', 'utf8').update(instrument ? 'instrument' : '').digest('hex'),

  process(src, filePath, jestConfig) {
    const testFile = `
            import execTest from 'jest-cucumber/dist/utils/parseFeature.js';
            
            execTest('${jestConfig.cwd}', '${filePath}', ${JSON.stringify(jestConfig.moduleFileExtensions)})
        `;
    const featureFile = (0, _core.transform)(testFile, {
      filename: filePath,
      presets: [_babelPresetJest.default],
      root: jestConfig.cwd
    });
    return featureFile ? featureFile.code : src;
  }

};
exports.default = _default;
//# sourceMappingURL=index.js.map