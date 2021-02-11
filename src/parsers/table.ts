import AsciiTable from 'ascii-table';

import {space} from '../configs/space';

export function createDataTable(rows) {
    const table = new AsciiTable();

    table.setHeading(...rows[0]);

    for (let i = 1; i < rows.length; i++) {
        table.addRow(...rows[i]);
    }

    return table
        .toString()
        .split('\n')
        .map((row) => space + row)
        .join('\n');
}

export function generateExampleTableSteps(examples, scenario) {
    return examples.reduce(
        (acc, example) => [
            ...acc,
            {
                ...scenario,
                name: parseGherkinVariables(example, scenario.name),
                steps: scenario.steps.map((step) => ({
                    ...step,
                    ...(step.docString
                        ? {
                              docString: {
                                  ...step.docString,
                                  content: parseGherkinVariables(
                                      example,
                                      step.docString.content
                                  )
                              }
                          }
                        : {}),
                    text: parseGherkinVariables(example, step.text)
                }))
            }
        ],
        []
    );
}

export function parseExampleTable(examples) {
    return (examples || []).reduce((acc, example) => {
        const keys = example.tableHeader.cells.reduce(
            (acc, cell) => [...acc, cell.value],
            []
        );

        return [
            ...acc,
            ...example.tableBody.reduce(
                (acc, row) => [
                    ...acc,
                    keys.reduce(
                        (acc, key, i) => [
                            ...acc,
                            {
                                key,
                                value: row.cells[i].value
                            }
                        ],
                        []
                    )
                ],
                []
            )
        ];
    }, []);
}

export function parseGherkinVariables(example, text) {
    return example.reduce((acc, variable) => {
        return acc.replace(new RegExp(`<${variable.key}>`), variable.value);
    }, text + '');
}
