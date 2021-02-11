import crypto from 'crypto';

import {transform} from '@babel/core';
import type {Config} from '@jest/types';
import jestPreset from 'babel-preset-jest';

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

        const restoreMocks = (!!jestConfig.restoreMocks).toString();

        const keepMocks = JSON.stringify(
            process.env.KEEP_MOCKS ? JSON.parse(process.env.KEEP_MOCKS) : []
        );

        const testFile = `
            const execTest = require('cucumber-jest/dist/utils/parseFeature');
            
            execTest('${jestConfig.cwd}', '${filePath}', ${extensions}, ${restoreMocks}, ${keepMocks})
        `;

        const featureFile = transform(testFile, {
            filename: filePath,
            presets: [jestPreset],
            root: jestConfig.cwd
        });

        return featureFile ? featureFile.code : src;
    }
};
