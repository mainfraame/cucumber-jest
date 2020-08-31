import { transform } from '@babel/core';
import jestPreset from 'babel-preset-jest';
import crypto from 'crypto';
import type { Config } from '@jest/types';
import path from 'path';

export default {
    canInstrument: false,
    getCacheKey: (fileData, filename, configString, {instrument}) => (
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
            .digest('hex')
    ),
    process(src: string, filePath: Config.Path, jestConfig: Config.ProjectConfig) {

        const pathToParser = path.resolve(jestConfig.cwd, './node_modules/jest-cucumber/dist/utils/parseFeature.js');

        const testFile = `
            import execTest from '${pathToParser}';
            
            execTest('${jestConfig.cwd}', '${filePath}', ${JSON.stringify(jestConfig.moduleFileExtensions)})
        `;

        const featureFile = transform(testFile, {
            filename: filePath,
            presets: [jestPreset],
            root: jestConfig.cwd
        });

        return featureFile ? featureFile.code : src;
    }
};
