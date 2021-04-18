import DataTable from '@cucumber/cucumber/lib/models/data_table';
import chalk from 'chalk';
import {filter, find, reduce} from 'inline-loops.macro';
import {outdent} from 'outdent';

import {space} from '../configs/space';
import {isJson} from '../utils/isJson';
import {createDataTable} from './table';

export function generateSnippet(step): string {
    return outdent`
        ${chalk.red(
            '[error]'
        )} could not find a step with pattern that matches the text:\n		
        ${chalk.yellow(step.text)}\n
        Implement with the following snippet:\n
        ${step.keyword.trim()}("${step.text}", function () {
            // Write code here
        });
        \n
    `;
}

export function parseSteps(steps, definitions) {
    return reduce(
        steps,
        (acc, step) => {
            const definition = find(definitions, (def) => {
                return def.matchesStepName(step.text);
            });

            const multiSteps = filter(definitions, (def) => {
                return def.matchesStepName(step.text);
            });

            if (!definition) {
                throw new Error(generateSnippet(step));
            }

            if (multiSteps.length > 1) {
                process.stdout.write(
                    `${chalk.yellow(
                        'Warning:'
                    )}\nmultiple steps found\nstep:${chalk.yellow(
                        step.text
                    )}\npatterns:\n${multiSteps
                        .map((step) => `- ${step.pattern.toString()}`)
                        .join('\n')}\n`
                );
            }

            const stepArgs = [
                ...(definition.expression
                    ?.match(step.text)
                    ?.map((arg) => arg.getValue()) ?? []),
                ...(step.dataTable ? [new DataTable(step.dataTable)] : []),
                ...(step.docString
                    ? [
                          isJson(step.docString.content)
                              ? JSON.parse(step.docString.content)
                              : step.docString.content
                      ]
                    : [])
            ];

            const type = (step.keyword || '').trim().toLowerCase();

            if (acc.last !== type && type !== 'and' && type !== 'but') {
                acc.last = type;
            }

            const tableDescription = step.dataTable
                ? '\n' + createDataTable(stepArgs[stepArgs.length - 1].rawTable)
                : '';

            const docStringDescription = step.docString
                ? '\n' +
                  step.docString.content
                      .split('\n')
                      .map((row) => space + `${row}`)
                      .join('\n')
                : '';

            return {
                ...acc,
                [acc.last]: [
                    ...(acc[acc.last] || []),
                    {
                        description: `${step.keyword}${step.text}${tableDescription}${docStringDescription}`,
                        ...step,
                        code: definition.code,
                        stepArgs
                    }
                ]
            };
        },
        {
            last: 'given',
            given: [],
            when: [],
            then: []
        }
    );
}
