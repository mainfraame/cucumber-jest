// we have to use spawnSync because transformers cannot be asynchronous

import {spawnSync} from 'child_process';
import path from 'path';

const getPathsPath = path.normalize(
    path.resolve(path.join(__dirname, 'getPathsWorker.js'))
);

export function getPaths(cwd: string, paths: string[], extensions: string[]) {
    return JSON.parse(
        spawnSync(
            'node',
            [
                getPathsPath,
                cwd,
                JSON.stringify(paths),
                JSON.stringify(extensions)
            ],
            {
                encoding: 'utf-8'
            }
        ).stdout
    );
}
