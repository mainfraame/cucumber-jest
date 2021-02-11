import {spawnSync} from 'child_process';
import fs from 'fs';
import path from 'path';

import escapeStringRegexp from 'escape-string-regexp';
import {flattenObject} from 'flatten-anything';
import {interopRequireDefault} from 'jest-util';

import * as env from '../configs/env';

export function parseFeature(
    cwd: string,
    featurePath: string,
    extensions: string[]
) {
    const source = fs.readFileSync(featurePath, 'utf8');

    const varMapExts = extensions.filter((ext) => ext !== 'feature');

    const fileExtension = path.extname(featurePath);
    const isJSON = fileExtension === 'json';

    const getPathsPath = path.normalize(
        path.resolve(path.join(__dirname, '../utils', 'getPaths.js'))
    );

    const varMapPathsForEnv = JSON.parse(
        spawnSync(
            'node',
            [
                getPathsPath,
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
                getPathsPath,
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
