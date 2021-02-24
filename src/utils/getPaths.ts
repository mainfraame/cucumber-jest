import glob from 'fast-glob';

export function getPaths(cwd: string, paths: string[]) {
    try {
        return glob.sync(paths, {
            cwd,
            absolute: true,
            onlyFiles: true
        });
    } catch (e) {
        console.error(e);
        return [];
    }
}
