import { spawnSync } from 'child_process';
import path from 'path';

export default function getMocks(cwd: string) {

    const mocks = spawnSync(
        'node',
        [path.resolve(__dirname, './getPaths.js'), cwd, '**/__mocks__/**/*'],
        {encoding: 'utf-8'}
    ).stdout;

    return JSON.parse(mocks)
        .filter((mock) => !mock.includes('node_modules'))
        .map((mock) => mock.replace(process.cwd(), ''))
        .map((mock) => (
            mock.startsWith('/__mocks__/') ?
                path.dirname(mock.replace('/__mocks__/', '')) :
                mock
        ));
}
