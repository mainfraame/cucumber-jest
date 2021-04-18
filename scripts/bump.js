#!/usr/bin/env node

const flags = process.argv.slice(2).map((a) => a.replace(/(-|--)/g, ''));

const {writeFileSync} = require('fs');
const {resolve} = require('path');
const semver = require('semver');

const pkgPath = resolve(__dirname, '..', 'package.json');

const pkg = require(pkgPath);

writeFileSync(
    pkgPath,
    JSON.stringify(
        {
            ...pkg,
            version: semver.inc(pkg.version, flags[0])
        },
        null,
        2
    )
);
