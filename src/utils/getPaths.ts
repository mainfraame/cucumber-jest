import fg from 'fast-glob';

const params = process.argv.slice(2);

(async () => {

    const extensions = params[2] ? `{${JSON.parse(params[2]).join(',')}}` : '*';

    const glob = `${params[0]}/${params[1]}.${extensions}`;

    const paths = await fg([glob], {
        cwd: params[0],
        absolute: true
    });

    process.stdout.write(JSON.stringify(paths), () => {
        process.exit();
    });

})();
