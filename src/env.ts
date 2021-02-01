const SPECIAL_TAGS = ['@debug', '@skip'];

const All_TAGS = (process.env.TAGS || '').split(',')
    .filter((tag) => tag)
    .map((tag) => tag.trim());

export const TAGS = All_TAGS
    .filter((tag) => !SPECIAL_TAGS.includes(tag));

export const HAS_SPECIAL_TAGS = All_TAGS
    .some((tag) => SPECIAL_TAGS.includes(tag));

export const EXCLUDE_TAGS = TAGS.filter((tag) => tag.startsWith('not'))
    .map((tag) => tag.split('not ')[1]);

export const INCLUDE_TAGS = TAGS.filter((tag) => !tag.startsWith('not'));

export const ENV_NAME = (process.env.ENV || '');
