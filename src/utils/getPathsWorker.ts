import path from 'path';

import fg from 'fast-glob';

const params = process.argv.slice(2);

(async () => {
    const paths = JSON.parse(params[1]);
    const extensions = params[2] ? `{${JSON.parse(params[2]).join(',')}}` : '*';

    const globs = paths.map((p) => path.join(params[0], `${p}.${extensions}`));

    const files = await fg(globs, {
        cwd: params[0],
        absolute: true
    });

    process.stdout.write(JSON.stringify(files), () => {
        process.exit();
    });
})();
