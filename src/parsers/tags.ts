import env from '../configs/env';

export function matchesTags(tagRaw) {
    const tag = tagRaw.replace('@', '');

    if (tag === 'skip') {
        return false;
    }

    if (tag === 'debug') {
        return true;
    }

    if (env.TAGS.length === 0) {
        return true;
    }

    const hasExcludes = env.EXCLUDE_TAGS.length > 0;
    const hasIncludes = env.INCLUDE_TAGS.length > 0;

    const isIncluded = hasIncludes && env.INCLUDE_TAGS.includes(tag);
    const isExcluded = hasExcludes && env.EXCLUDE_TAGS.includes(tag);

    return isExcluded ? false : !hasIncludes || isIncluded;
}
