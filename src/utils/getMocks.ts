import { spawnSync } from 'child_process';
import path from 'path';

export default function getMocks(cwd: string) {

    const mocks = spawnSync(
        'node',
        [path.resolve(__dirname, './getPaths.js'), cwd, '**/__mocks__/**/*'],
        {encoding: 'utf-8'}
    ).stdout;

    return JSON.parse(mocks);
}
