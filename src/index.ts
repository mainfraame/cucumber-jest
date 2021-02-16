import crypto from 'crypto';

import {transform} from '@babel/core';
import type {Config} from '@jest/types';
import jestPreset from 'babel-preset-jest';

export type {Spec} from './parsers/suite';

export default {
    canInstrument: false,
    getCacheKey: (fileData, filename, configString, {instrument}) =>
        crypto
            .createHash('md5')
            .update('\0', 'utf8')
            .update(fileData)
            .update('\0', 'utf8')
            .update(filename)
            .update('\0', 'utf8')
            .update(configString)
            .update('\0', 'utf8')
            .update('\0', 'utf8')
            .update(instrument ? 'instrument' : '')
            .digest('hex'),
    process(
        src: string,
        filePath: Config.Path,
        jestConfig: Config.ProjectConfig
    ) {
        const extensions = JSON.stringify(jestConfig.moduleFileExtensions);

        const testFile = `
            const exec = require('cucumber-jest/dist/exec').exec;            
            exec('${jestConfig.cwd}', '${filePath}', ${extensions})
        `;

        const featureFile = transform(testFile, {
            filename: filePath,
            presets: [jestPreset],
            root: jestConfig.cwd
        });

        return featureFile ? featureFile.code : src;
    }
};
