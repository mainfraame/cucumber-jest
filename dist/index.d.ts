import type { Config } from '@jest/types';
declare const _default: {
    canInstrument: boolean;
    getCacheKey: (fileData: any, filename: any, configString: any, { instrument }: {
        instrument: any;
    }) => string;
    process(src: string, filePath: Config.Path, jestConfig: Config.ProjectConfig): string;
};
export default _default;
