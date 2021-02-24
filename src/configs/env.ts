import os from 'os';
import path from 'path';

const RESERVED_TAGS = ['@debug', '@skip'];

const All_TAGS = (process.env.TAGS || '')
    .split(',')
    .filter((tag) => tag)
    .map((tag) => tag.trim());

const TAGS = All_TAGS.filter((tag) => !RESERVED_TAGS.includes(tag));

const env = {
    ENV_NAME: process.env.ENV || '',
    EXCLUDE_TAGS: TAGS.filter((tag) => tag.startsWith('not')).map(
        (tag) => tag.split('not ')[1]
    ),
    INCLUDE_TAGS: TAGS.filter((tag) => !tag.startsWith('not')),
    TAGS,
    TEMP_PATH: path.join(os.tmpdir(), 'cucumber-jest'),
    SHOW_TEMP_PATH: process.env.CUCUMBER_JEST_SHOW_TEMP_PATH === 'true'
};

if (env.SHOW_TEMP_PATH) {
    process.stdout.write(`\ntemporary directory: ${env.TEMP_PATH}\n`);
}

export default env;
