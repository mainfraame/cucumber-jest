import fs from 'fs';
import path from 'path';

import escapeStringRegexp from 'escape-string-regexp';
import {flattenObject} from 'flatten-anything';
import {interopRequireDefault} from 'jest-util';
import mergeDeep from 'merge-deep';

import env from '../configs/env';
import {getPaths} from '../utils/getPaths';

// todo:: clean functions up

export function getVariables(
    cwd: string,
    featurePath: string,
    extensions: string[]
): false | Record<string, unknown> {
    const varMapExts = extensions.filter((ext) => ext !== 'feature');

    const fileExtension = path.extname(featurePath);

    // if ENV is provided get all the variable file paths that match the
    // feature file name or global.vars with the ENV
    const varMapPathsForEnv = env.ENV_NAME
        ? getPaths(
              cwd,
              [
                  path.join(
                      '**',
                      `${path.basename(featurePath, fileExtension)}.vars.${
                          env.ENV_NAME
                      }`
                  ),
                  ...(env.ENV_NAME
                      ? [path.join('**', `global.vars.${env.ENV_NAME}`)]
                      : [])
              ],
              varMapExts
          )
        : [];

    // get all the variable file paths that match the
    // feature file name or global.vars
    const varMapPaths = getPaths(
        cwd,
        [
            path.join(
                '**',
                `${path.basename(featurePath, fileExtension)}.vars`
            ),
            path.join('**', 'global.vars')
        ],
        varMapExts
    );

    const allVarFiles = [...varMapPathsForEnv, ...varMapPaths];

    // if no files were found, skip parsing / writing temp feature file
    if (allVarFiles.length === 0) {
        return false;
    }

    const globalVarsEnvFile = allVarFiles.find(
        (file) => env.ENV_NAME && file.includes(`global.vars.${env.ENV_NAME}`)
    );

    const globalVarsFile = allVarFiles.find(
        (file) => !env.ENV_NAME && file.includes('global.vars')
    );

    const varsEnvFile = allVarFiles.find(
        (file) =>
            env.ENV_NAME &&
            file.includes(
                `${path.basename(featurePath, fileExtension)}.vars.${
                    env.ENV_NAME
                }`
            )
    );

    const varsFile = allVarFiles.find(
        (file) =>
            !env.ENV_NAME &&
            file.includes(`${path.basename(featurePath, fileExtension)}.vars`)
    );

    // concat list of variable files, prioritizing files with feature name and env over
    // global files and env
    const varFiles = [
        ...(globalVarsEnvFile ? [globalVarsEnvFile] : [globalVarsFile]),
        ...(varsEnvFile ? [varsEnvFile] : [varsFile])
    ].filter(Boolean);

    // require all the variable files and merge them into a single object
    // ordering set above will ensure that variable files with feature name will override
    // any of the same values that are in global files.
    const vars = varFiles.length
        ? [...varMapPaths, ...varMapPathsForEnv]
              .filter((path) => !path.includes('node_modules'))
              .reduce(
                  (acc, file) => {
                      const raw = interopRequireDefault(require(file));

                      return mergeDeep(acc, raw?.default || raw);
                  },
                  {} as {
                      [name: string]: string | boolean | Date | number;
                  }
              )
        : null;

    return flattenObject(vars);
}

export function populateVariables(
    cwd: string,
    featurePath: string,
    variables: Record<string, unknown>
) {
    const source = fs.readFileSync(featurePath, 'utf8');

    const tmpSource = source
        .split('\n')
        .map((row) => {
            return variables
                ? Object.entries(variables).reduce(
                      (acc, [key, value]) =>
                          acc.replace(
                              new RegExp(
                                  '(^|\\s|")\\$' +
                                      escapeStringRegexp(key) +
                                      '(\\s|$|")',
                                  'g'
                              ),
                              (text, ...args) => {
                                  const offset = args[args.length - 2];

                                  const hasStartSpace = text.startsWith(' ');
                                  const hasEndSpace = text.endsWith(' ');
                                  const hasStartQuotes = text.startsWith('"');
                                  const hasEndQuotes = text.endsWith('"');

                                  // todo:: figure out any scenarios where we would need to escape chars for
                                  //        variables used in json

                                  // const isWrappedInQuotes =
                                  //     hasStartQuotes && hasEndQuotes;
                                  //
                                  // const nextChar = source.charAt(
                                  //     offset + text.length
                                  // );
                                  //
                                  // const prevCharMinusTwo = row.charAt(
                                  //     offset - 2
                                  // );
                                  //
                                  // const prevCharMinusOne = row.charAt(
                                  //     offset - 1
                                  // );

                                  // const hasColon = [
                                  //     prevCharMinusOne,
                                  //     prevCharMinusTwo
                                  // ].some((char) => char === ':');

                                  // const isJSON =
                                  //     (isWrappedInQuotes &&
                                  //         nextChar === ',' &&
                                  //         hasColon) ||
                                  //     (isWrappedInQuotes && hasColon);

                                  const rowTrimmed = row.trim();

                                  const isDataTable =
                                      row.includes('|') &&
                                      row.match(/\|/g).length >= 2 &&
                                      rowTrimmed.endsWith('|') &&
                                      rowTrimmed.startsWith('|');

                                  // replace any characters that were captured as part of the regexp
                                  const baseValue =
                                      (hasStartSpace ? ' ' : '') +
                                      (hasStartQuotes ? '"' : '') +
                                      value.toString() +
                                      (hasEndQuotes ? '"' : '') +
                                      (hasEndSpace ? ' ' : '');

                                  return isDataTable
                                      ? baseValue.replace('|', '\\|')
                                      : baseValue;
                              }
                          ),
                      row + ''
                  )
                : row;
        })
        .join('\n');

    // if the feature file changed from injecting variables, write the temp file
    if (tmpSource !== source) {
        // derive the temporary path for the feature file w/ injected variables
        const featureSourcePath =
            tmpSource !== source
                ? path.normalize(
                      path.resolve(env.TEMP_PATH, path.basename(featurePath))
                  )
                : featurePath;

        if (!fs.existsSync(env.TEMP_PATH)) {
            fs.mkdirSync(env.TEMP_PATH);
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
