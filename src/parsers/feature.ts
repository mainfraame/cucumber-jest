import {getVariables, populateVariables} from './variables';

export function parseFeature(
    cwd: string,
    featurePath: string,
    extensions: string[]
) {
    const variables = getVariables(cwd, featurePath, extensions);

    return variables
        ? populateVariables(cwd, featurePath, variables)
        : featurePath;
}
