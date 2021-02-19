import path from 'path';

const RESERVED_TAGS = ['@debug', '@skip'];

const All_TAGS = (process.env.TAGS || '')
    .split(',')
    .filter((tag) => tag)
    .map((tag) => tag.trim());

const TAGS = All_TAGS.filter((tag) => !RESERVED_TAGS.includes(tag));

export default {
    ENV_NAME: process.env.ENV || '',
    EXCLUDE_TAGS: TAGS.filter((tag) => tag.startsWith('not')).map(
        (tag) => tag.split('not ')[1]
    ),
    INCLUDE_TAGS: TAGS.filter((tag) => !tag.startsWith('not')),
    TAGS,
    TEMP_PATH: path.normalize(
        path.resolve(
            path.join(process.cwd(), path.join('node_modules', '__tmp__'))
        )
    )
};
