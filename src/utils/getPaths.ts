import fg from 'fast-glob';
import path from 'path';

const params = process.argv.slice(2);

(async () => {

    const extensions = params[2] ? `{${JSON.parse(params[2]).join(',')}}` : '*';

    const glob = path.normalize(path.join(params[0],`${params[1]}.${extensions}`));

    const paths = await fg([glob], {
        cwd: params[0],
        absolute: true
    });

    process.stdout.write(JSON.stringify(paths), () => {
        process.exit();
    });

})();
