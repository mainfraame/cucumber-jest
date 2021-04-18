import fs from 'fs';
import path from 'path';

import interopRequireDefault from '@babel/runtime-corejs3/helpers/interopRequireDefault';
import escapeStringRegexp from 'escape-string-regexp';
import {flattenObject} from 'flatten-anything';
import {filter, reduce} from 'inline-loops.macro';
import mergeDeep from 'merge-deep';
import mkdirp from 'mkdirp';

import env from '../configs/env';
import {getPaths} from '../utils/getPaths';

export function getVariables(
    cwd: string,
    featurePath: string,
    extensions: string[]
): false | Record<string, unknown> {
    const varExts = filter(extensions, (ext) => ext !== 'feature');

    const fileExtension = path.extname(featurePath);
    const fileName = path.basename(featurePath, fileExtension);
    const varExtensions = varExts.join(',');

    const envPaths = [
        path.normalize(
            path.join('{,!(node_modules)/**}', `global.vars.{${varExtensions}}`)
        ),
        ...(env.ENV_NAME
            ? [
                  path.normalize(
                      path.join(
                          '{,!(node_modules)/**}',
                          `global.vars.${env.ENV_NAME}.{${varExtensions}}`
                      )
                  )
              ]
            : []),
        path.normalize(
            path.join(
                '{,!(node_modules)/**}',
                `${fileName}.vars.{${varExtensions}}`
            )
        ),
        ...(env.ENV_NAME
            ? [
                  path.normalize(
                      path.join(
                          '{,!(node_modules)/**}',
                          `${fileName}.vars.${env.ENV_NAME}.{${varExtensions}}`
                      )
                  )
              ]
            : [])
    ];

    const allVarFiles = getPaths(cwd, envPaths) || [];

    // if no files were found, skip parsing / writing temp feature file
    if (allVarFiles.length === 0) {
        return false;
    }

    // const featureFileName = path.basename(featurePath, fileExtension);
    // const fileExtensions = varExts.join('|');

    // const globalVarsRegex = new RegExp(
    //     `global.vars.(${
    //         env.ENV_NAME
    //             ? `?(${env.ENV_NAME})?.${fileExtensions}`
    //             : `${fileExtensions}`
    //     })`
    // );
    //
    // const featureVarsRegex = new RegExp(
    //     `${featureFileName}.vars.(${
    //         env.ENV_NAME
    //             ? `?(${env.ENV_NAME}?.${fileExtensions})`
    //             : `${fileExtensions}`
    //     })`
    // );

    const globalVarFiles = filter(allVarFiles, (file: string) =>
        file.includes('global.vars')
    )
        .sort()
        .reverse();

    const suiteVarFiles = filter(
        allVarFiles,
        (file) => !file.includes('global.vars')
    )
        .sort()
        .reverse();

    // concat list of variable files, prioritizing feature over global files
    const varFiles = filter([...globalVarFiles, ...suiteVarFiles], Boolean);

    if (!varFiles.length) {
        return null;
    }

    // require all the variable files and merge them into a single object
    // ordering set above will ensure that variable files with feature name will override
    // any of the same values that are in global files.
    const vars = reduce(
        varFiles,
        (acc, file) => {
            const raw = interopRequireDefault(require(file));

            return mergeDeep(acc, raw?.default || raw);
        },
        {} as {
            [name: string]: string | boolean | Date | number;
        }
    );

    return flattenObject(vars);
}

// todo:: clean functions up
function replaceVariables(acc, row, key, value) {
    return acc.replace(
        new RegExp('(^|\\s|")\\$' + escapeStringRegexp(key) + '(\\s|$|")', 'g'),
        (text) => {
            const hasStartSpace = text.startsWith(' ');
            const hasEndSpace = text.endsWith(' ');
            const hasStartQuotes = text.startsWith('"');
            const hasEndQuotes = text.endsWith('"');

            // todo:: figure out any scenarios where we would need to escape chars for
            //        variables used in json
            //
            // const offset = args[args.length - 2];
            //
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

            // escape any pipes if value contains pipe and found in data table
            return isDataTable ? baseValue.replace('|', '\\|') : baseValue;
        }
    );
}

function populateRow<T = any>(row: string, variables: [string, T][]) {
    return reduce(
        variables,
        (acc, entry) => replaceVariables(acc, row, entry[0], entry[1]),
        row + ''
    );
}

export function populateVariables(
    cwd: string,
    featurePath: string,
    variables: Record<string, unknown>
) {
    const variableEntries = Object.entries(variables || {});

    if (!variableEntries.length) {
        return featurePath;
    }

    const source = fs.readFileSync(featurePath, 'utf8');

    let tmpSource: string[] | string = [];

    const rows = source.split('\n');

    // inline-loops will not convert nested methods
    for (let i = 0; i < rows.length; i++) {
        tmpSource.push(populateRow(rows[i], variableEntries));
    }

    tmpSource = tmpSource.join('\n');

    // if the feature file changed from injecting variables, write the temp file
    if (tmpSource !== source) {
        mkdirp.sync(env.TEMP_PATH);
        // ensure the temp directory exists

        // derive the temporary path for the feature file w/ injected variables
        const featureSourcePath = path.join(
            env.TEMP_PATH,
            path.basename(featurePath)
        );

        // write the temp feature file to tmp directory
        fs.writeFileSync(featureSourcePath, tmpSource);

        // return temp feature file path
        return featureSourcePath;
    }

    return featurePath;
}
