"use strict";

var _fastGlob = _interopRequireDefault(require("fast-glob"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const params = process.argv.slice(2);

(async () => {
  const extensions = params[2] ? `{${JSON.parse(params[2]).join(',')}}` : '*';
  const glob = `${params[0]}/${params[1]}.${extensions}`;
  const paths = await (0, _fastGlob.default)([glob], {
    cwd: params[0],
    absolute: true
  });
  process.stdout.write(JSON.stringify(paths), () => {
    process.exit();
  });
})();
//# sourceMappingURL=getPaths.js.map