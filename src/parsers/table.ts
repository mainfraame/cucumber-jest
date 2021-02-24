import AsciiTable from 'ascii-table';
import {map, reduce} from 'inline-loops.macro';

import {space} from '../configs/space';

export function createDataTable(rows) {
    const table = new AsciiTable();

    table.setHeading(...rows[0]);

    for (let i = 1; i < rows.length; i++) {
        table.addRow(...rows[i]);
    }

    return map(table.toString().split('\n'), (row) => space + row).join('\n');
}

export function generateExampleTableSteps(examples, scenario) {
    return reduce(
        examples,
        (acc, example) => [
            ...acc,
            {
                ...scenario,
                name: parseVariables(example, scenario.name),
                steps: map(scenario.steps, (step) => ({
                    ...step,
                    ...(step.docString
                        ? {
                              docString: {
                                  ...step.docString,
                                  content: parseVariables(
                                      example,
                                      step.docString.content
                                  )
                              }
                          }
                        : {}),
                    text: parseVariables(example, step.text)
                }))
            }
        ],
        []
    );
}

export function parseExampleTable(examples) {
    return reduce(
        examples || [],
        (acc, example) => {
            const keys = reduce(
                example.tableHeader.cells,
                (acc, cell) => [...acc, cell.value],
                []
            );

            return [
                ...acc,
                ...reduce(
                    example.tableBody,
                    (acc, row) => [
                        ...acc,
                        parseExampleTableKeyAndValues(keys, row)
                    ],
                    []
                )
            ];
        },
        []
    );
}

function parseExampleTableKeyAndValues(keys, row) {
    return reduce(
        keys,
        (acc, key, i) => [
            ...acc,
            {
                key,
                value: row.cells[i].value
            }
        ],
        []
    );
}

export function parseVariables(example, text) {
    return reduce(
        example,
        (acc, variable) => {
            return acc.replace(new RegExp(`<${variable.key}>`), variable.value);
        },
        text + ''
    );
}
