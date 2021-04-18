# cucumber-jest

[![Build Passing](https://img.shields.io/badge/build-passing-green.svg)](https://github.com/Naereen/badges) 
[![Build Passing](https://img.shields.io/badge/dependencies-up_to_date-green.svg)](https://github.com/Naereen/badges)
[![Branches](.badges/badge-branches.svg)](https://github.com/Naereen/badges)
[![Functions](.badges/badge-functions.svg)](https://github.com/Naereen/badges)
[![Lines](.badges/badge-lines.svg)](https://github.com/Naereen/badges)
[![Statements](.badges/badge-statements.svg)](https://github.com/Naereen/badges)

A transformer for executing cucumber tests in jest

```bash
npm i cucumber-jest -D
```

## Table of Contents

-   [Gherkin Features](#gherkin-features)
-   [Cucumber Features](#cucumber-features)
-   [Getting Started](#getting-started)
    -   [Jest Config](#jest-config)
    -   [World](#world)
    -   [Hooks](#hooks)
    -   [Steps](#steps)
    -   [Feature](#feature)
    -   [Tags \[Experimental\]](#tags-experimental)
    -   [Variables](#variables)
-   [Cucumber Docs](#cucumber-docs)

## Gherkin Features

| Supported          | Feature                                                                                                                              | Notes                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| :white_check_mark: | [And](https://cucumber.io/docs/gherkin/reference/#steps)                                                                             |                                                             |
| :white_check_mark: | [Background](https://cucumber.io/docs/gherkin/reference/#background)                                                                 |                                                             |
| :white_check_mark: | [But](https://cucumber.io/docs/gherkin/reference/#steps)                                                                             |                                                             |
| :white_check_mark: | [Comments](https://cucumber.io/docs/gherkin/reference/#descriptions)                                                                 |                                                             |
| :white_check_mark: | [Data Table](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/data_table_interface.md)                         |                                                             |
| :white_check_mark: | [DocString](http://rmpestano.github.io/cukedoctor/cucumber-js/cucumber-js-documentation.html#_steps_accepting_a_docstring_parameter) | if it finds the docString is JSON, it will parse it for you |
|                    | [Rule](https://cucumber.io/docs/gherkin/reference/#rule)                                                                             | haven't seen examples of this; not sure if it's worth it    |
| :white_check_mark: | [Scenario](https://cucumber.io/docs/gherkin/reference/#descriptions)                                                                 |                                                             |
| :white_check_mark: | [Scenario Outline](http://rmpestano.github.io/cukedoctor/cucumber-js/cucumber-js-documentation.html#Scenario-Outlines-and-Examples)  |                                                             |

## Cucumber Features

| Supported          | Feature                                                                                                                                                     | Notes                                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| :white_check_mark: | [After](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#afteroptions-fn)                                            | called after each scenario in a feature file                                                              |
| :white_check_mark: | [AfterAll](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#afteralloptions-fn)                                      | called after the feature file is completed; unlike Cucumber, you will have access to "this" context here. |
|                    | [Attachments](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/attachments.md)                                                        | use a reporter like `jest-html-reporters` and its attach utility instead                                  |
| :white_check_mark: | [Before](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#beforeoptions-fn)                                          | called before each scenario per feature file                                                              |
| :white_check_mark: | [BeforeAll](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#beforealloptions-fn)                                    | called before the feature file is started; unlike Cucumber, you will have access to "this" context here.  |
| :white_check_mark: | [expressions](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/step_definitions.md#cucumber-expressions)                              |                                                                                                           |
| :white_check_mark: | [Given](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#givenpattern-options-fn)                                    |                                                                                                           |
|                    | [setDefaultTimeout](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#setdefaulttimeoutmilliseconds)                  | use jest.setTimeout or set the timeout property in your jest config                                       |
| :white_check_mark: | [setDefinitionFunctionWrapper](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#setdefinitionfunctionwrapperwrapper) |                                                                                                           |
| :white_check_mark: | [setWorldConstructor](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#setworldconstructorconstructor)               |                                                                                                           |
| :white_check_mark: | [Tags](https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#tags)                                                                                |                                                                                                           |
| :white_check_mark: | [Then](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#thenpattern-options-fn)                                      |                                                                                                           |
| :white_check_mark: | [When](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#whenpattern-options-fn)                                      |                                                                                                           |

## Getting Started

### Jest Config

You'll need to add the following to your jest config:

```json
{
    "moduleFileExtensions": [
        "feature",
        // <--- *1
        "js",
        "json",
        "ts",
        "tsx"
    ],
    "setupFilesAfterEnv": [
        "<rootDir>/node_modules/cucumber-jest/dist/init.js",
        // <--- *2
        "<rootDir>/path/to/your/world.ts",
        "<rootDir>/path/to/your/hooks.tsx",
        "<rootDir>/path/to/your/steps.ts"
    ],
    "transform": {
        "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
        "^.+\\.(feature)$": "cucumber-jest"
        // <--- *3
    },
    "testMatch": [
        "<rootDir>/path/to/your/*.feature"
        // <--- *4
    ]
}
```

1. Add `feature` to _moduleFileExtensions_
2. Add `"<rootDir>/node_modules/cucumber-jest/dist/init.js"` to _setupFilesAfterEnv_
    - this file calls cucumber's _supportCodeLibraryBuilder.reset_ which sets up cucumber to start capturing registered
      hooks / steps
    - it's important to note that this file must be list first in the _setupFilesAfterEnv_ list of files; before your
      world, hooks, or step files
3. Add `"^.+\\.(feature)$": "cucumber-jest"` as a _transformer_
4. Add `"<rootDir>/path/to/your/*.feature"` as a _testMatch_ pattern

## Example

The code-snippets below are taken from the [example project](test/example)

## World

[setWorldConstructor](test/world.ts) allows you to set the context of "this" for your steps/hooks definitions.

This can be helpful when you want to maintain state, access _globals_, or assign component testing classes. The values
are accessible within all Hooks and Steps.

```typescript
import { setWorldConstructor } from '@cucumber/cucumber';

import Element from './element';
import { $server, $spy } from './mocks';

/**
 *  Element class is a helper provided in the example project
 *  for more details, please see the example project
 */

export class TestWorld {
    $server = $server; // reference to mws (mock-server-worker) setupServer
    $spy = $spy;       // jest.fn()

    email = new Element({name: 'email'});
    extraEmails = new Element({name: 'extraEmails'});
    firstName = new Element({name: 'firstName'});
    lastName = new Element({name: 'lastName'});
    password = new Element({name: 'password'});
    reset = new Element({dataId: 'reset'});
    submit = new Element({dataId: 'submit'});
    successAlert = new Element({dataId: 'successAlert'});
    showExtraEmailsAlert = new Element({dataId: 'showExtraEmailsAlert'});
}

setWorldConstructor(
    TestWorld
);
```

## Hooks

\*Unlike cucumber.js, _"this"_ is accessible inside **_BeforeAll_** and **_AfterAll_** hooks, and they receive two
additional parameters: [Spec](https://github.com/mainfraame/cucumber-jest/blob/master/src/parsers/suite.ts#L15) and
the **fileName**

If you are using these two params with **typescript**, you'll notice that it shows a typing error. The library does not
currently augment cucumber's **hook** typings to add the two **additional params**; if anyone has a solution, please
contribute.

```typescript
import { After, AfterAll, Before, BeforeAll } from '@cucumber/cucumber';
import { Spec } from 'cucumber-jest';
import { advanceTo, clear } from 'jest-date-mock';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import { SignUp } from '../src/signUp';
import { TestWorld } from './world';

const $root = document.createElement('div');

document.body.appendChild($root);

BeforeAll(async function (this: TestWorld, spec: Spec, fileName: string) {
    console.log('spec::', spec);
    console.log('fileName::', fileName);

    this.$server.listen();

    advanceTo(new Date('2019-12-01T15:00:00.000Z'));

    act(() => {
        ReactDOM.render(<SignUp / >, $root);
    });
});

Before(function (this: TestWorld) {
    // do something before each spec
});

After(function (this: TestWorld) {
    this.$spy.mockClear();
    this.$server.resetHandlers();
});

AfterAll(async function (this: TestWorld) {
    clear();

    act(() => {
        ReactDOM.unmountComponentAtNode($root);
    });

    this.$server.close();
});
```

## Steps

```typescript
import { Given, Then, When } from '@cucumber/cucumber';

import type { TestWorld } from './world';

Given(/^the (\S+) component rendered$/,
    async function (this: TestWorld, name) {
        await this[name].click();
    }
);

When('the {word} button is clicked',
    async function (this: TestWorld, name) {
        await this[name].click();

        await this[name].waitForEnabled();
    }
);

When(
    /^the (\S+) text input value is (.*)$/,
    async function (this: TestWorld, name, value) {
        await this[name].setValue(value);
    }
);

When(
    /^the (\S+) checkbox input is (checked|not checked)$/,
    async function (this: TestWorld, name, state) {
        const currentValue = this[name].getAttribute('checked');

        if (currentValue !== (state === 'checked')) {
            await this[name].click();
        }
    }
);

Then(
    /^(GET|PUT|POST|DELETE) (.*) is called with the (request body|params):$/,
    function (this: TestWorld, method, url, type, value) {
        const hasBody = type === 'request body';

        expect(this.$spy).toHaveBeenCalledWith({
            url,
            method,
            ...(hasBody ? {data: value} : {params: value})
        });
    }
);

Then(
    /^the (\S+) is (visible|not visible)$/,
    async function (this: TestWorld, name, state) {
        await this[name][
            state === 'visible' ? 'waitForInDom' : 'waitForNotInDom'
            ]();

        expect(this[name].isInDom()).toEqual(state === 'visible');
    }
);

Then(
    /^the (\S+) inner text is "(.*)"$/,
    function (this: TestWorld, name, innerText) {
        expect(this[name].innerText()).toEqual(innerText);
    }
);
```

## Feature

```feature
Feature: Sign Up

  Scenario: Without Extra Emails
    Given the firstName text input value is James
    And the lastName text input value is Dean
    And the email text input value is james.dean@gmail.com
    And the password text input value is itsASecretShh...
    When the submit button is clicked
    Then POST /api/sign-up is called with the request body:
      """
       {
           "firstName": "James",
           "lastName": "Dean",
           "email": "james.dean@gmail.com",
           "password": "itsASecretShh...",
           "extraEmails": false,
           "date": "2019-12-01T15:00:00.000Z"
       }
      """
    And the successAlert is visible
    And the showExtraEmailsAlert is not visible

  Scenario: With Extra Emails
    Given the firstName text input value is James
    And the lastName text input value is Dean
    And the email text input value is james.dean@gmail.com
    And the password text input value is itsASecretShh...
    And the extraEmails checkbox input is checked
    When the submit button is clicked
    Then POST /api/sign-up is called with the request body:
      """
       {
           "firstName": "James",
           "lastName": "Dean",
           "email": "james.dean@gmail.com",
           "password": "itsASecretShh...",
           "extraEmails": true,
           "date": "2019-12-01T15:00:00.000Z"
       }
      """
    And the successAlert is visible
    And the showExtraEmailsAlert is visible
```

### Output

Below is an example output from running tests against the [example project](example)

```text
  PASS  test/features/scenario.feature (110 MB heap size)
  Feature: Sign Up
    Scenario: Without Extra Emails
      ✓ Given the firstName text input value is James (21 ms)
      ✓ And the lastName text input value is Dean (8 ms)
      ✓ And the email text input value is james.dean@gmail.com (8 ms)
      ✓ And the password text input value is itsASecretShh... (10 ms)
      ✓ When the submit button is clicked (200 ms)
      ✓ Then POST /api/sign-up is called with the request body:
       {
           "firstName": "James",
           "lastName": "Dean",
           "email": "james.dean@gmail.com",
           "password": "itsASecretShh...",
           "extraEmails": false,
           "date": "2019-12-01T15:00:00.000Z"
       } (2 ms)
      ✓ And the successAlert is visible (26 ms)
      ✓ And the showExtraEmailsAlert is not visible (12 ms)
    Scenario: With Extra Emails
      ✓ Given the firstName text input value is James (16 ms)
      ✓ And the lastName text input value is Dean (9 ms)
      ✓ And the email text input value is james.dean@gmail.com (11 ms)
      ✓ And the password text input value is itsASecretShh... (10 ms)
      ✓ And the extraEmails checkbox input is checked (45 ms)
      ✓ When the submit button is clicked (84 ms)
      ✓ Then POST /api/sign-up is called with the request body:
       {
           "firstName": "James",
           "lastName": "Dean",
           "email": "james.dean@gmail.com",
           "password": "itsASecretShh...",
           "extraEmails": true,
           "date": "2019-12-01T15:00:00.000Z"
       } (1 ms)
      ✓ And the successAlert is visible (2 ms)
      ✓ And the showExtraEmailsAlert is visible (1 ms)

Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
Snapshots:   0 total
Time:        5.066 s
```

## Tags [Experimental]

### Built-In

There are two tags that come built in:

| tag    | description                                    |
| ------ | ---------------------------------------------- |
| @skip  | skips the scenario                             |
| @debug | only execute that scenario in the feature file |

#### @debug Example

```gherkin
Feature: Sign Up W/ Background & Tags Example

  Background:
    Given the firstName text input value is James
    And the lastName text input value is Dean
    And the email text input value is james.dean@gmail.com
    And the password text input value is itsASecretShh...

  @debug
  Scenario: Without Extra Emails
    When the submit button is clicked
    Then POST /api/sign-up is called with the request body:
      """
       {
           "firstName": "James",
           "lastName": "Dean",
           "email": "james.dean@gmail.com",
           "password": "itsASecretShh...",
           "extraEmails": false,
           "date": "2019-12-01T15:00:00.000Z"
       }
      """
    And the successAlert is visible
    And the showExtraEmailsAlert is not visible

  Scenario: With Extra Emails
    When the extraEmails checkbox input is checked
    And the submit button is clicked
    Then POST /api/sign-up is called with the request body:
      """
       {
           "firstName": "James",
           "lastName": "Dean",
           "email": "james.dean@gmail.com",
           "password": "itsASecretShh...",
           "extraEmails": true,
           "date": "2019-12-01T15:00:00.000Z"
       }
      """
    And the successAlert is visible
    And the showExtraEmailsAlert is visible
```

#### @skip Example

```gherkin
Feature: Sign Up W/ Background & Tags Example

  Background:
    Given the firstName text input value is James
    And the lastName text input value is Dean
    And the email text input value is james.dean@gmail.com
    And the password text input value is itsASecretShh...

  @skip
  Scenario: Without Extra Emails
    When the submit button is clicked
    Then POST /api/sign-up is called with the request body:
      """
       {
           "firstName": "James",
           "lastName": "Dean",
           "email": "james.dean@gmail.com",
           "password": "itsASecretShh...",
           "extraEmails": false,
           "date": "2019-12-01T15:00:00.000Z"
       }
      """
    And the successAlert is visible
    And the showExtraEmailsAlert is not visible

  Scenario: With Extra Emails
    When the extraEmails checkbox input is checked
    And the submit button is clicked
    Then POST /api/sign-up is called with the request body:
      """
       {
           "firstName": "James",
           "lastName": "Dean",
           "email": "james.dean@gmail.com",
           "password": "itsASecretShh...",
           "extraEmails": true,
           "date": "2019-12-01T15:00:00.000Z"
       }
      """
    And the successAlert is visible
    And the showExtraEmailsAlert is visible
```

### Custom

Tags are supported by using the environment variable `TAGS` with a comma delimited list of strings. For best results,
use the tags only at the `scenario` level. Support for `feature` level will be added later.
**_Unfortunately_**, jest cli does not support custom commands and will throw an error if you try to use them. For this
reason, we need to use environment variables to pass these.

#### Inclusive Example:

```bash
TAGS=foo,bar jest

TAGS=foo, bar jest # space is trimmed
```

#### Exclusive Example:

```bash
TAGS="not foo" jest

TAGS="not foo, not bar" jest
```

#### Exclusive & Inclusive Example:

```bash
TAGS="bar, not foo" jest
```

## Variables

You can inject values into your feature files using variables.

When variable files are found and injected into a feature file
has variables injected, a temporary feature file with the same name is written to your os's temporary folder;
eg. for mac users, `/var/folders/sb/2wr3vgcd1sxg4tgv1mr8dtq80000gn/T/cucumber-jest`

If you need to figure out the temporary folder path, run the jest with this environment variable `CUCUMBER_JEST_SHOW_TEMP_PATH=true`.

### Use Without ENV

Set up a file where the name matches the file you're targeting and include **.vars** in the name, eg.

| Feature File            | Variable File                 |
| ----------------------- | ----------------------------- |
| scenarioOutline.feature | scenarioOutline.**vars**.js   |
| scenarioOutline.feature | scenarioOutline.**vars**.json |
| scenarioOutline.feature | scenarioOutline.**vars**.ts   |

### Use With ENV

Alternatively, you can have variables target an environment by setting the `ENV` environment variable and using it in
the variables file name.

Below are multiple examples with different ENV values and extensions:

| Environment Variable | Feature File            | Variable File                     |
| -------------------- | ----------------------- | --------------------------------- |
| ENV=**dev**          | scenarioOutline.feature | scenarioOutline.vars.**dev**.js   |
| ENV=**dev**          | scenarioOutline.feature | scenarioOutline.vars.**dev**.json |
| ENV=**dev**          | scenarioOutline.feature | scenarioOutline.vars.**dev**.ts   |
| ENV=**qa**           | scenarioOutline.feature | scenarioOutline.vars.**qa**.js    |
| ENV=**qa**           | scenarioOutline.feature | scenarioOutline.vars.**qa**.json  |
| ENV=**qa**           | scenarioOutline.feature | scenarioOutline.vars.**qa**.ts    |

### Example Variable Use

Properties in your variable files can be used in your feature file by prefixing the json path with **$**, eg.

| Property Name In Feature File | Property Name In Variable File |
| ----------------------------- | ------------------------------ |
| $firstName                    | firstName                      |

\*\* nested structures are also supported, please see examples below.

### Example With ENV & Flat Variables Structure

#### Testing Command:

```bash
ENV=dev $(npm bin)/jest
```

#### Variables File: `scenarioOutline.vars.dev.ts`

```typescript
export default {
    email: 'james.dean@gmail.com',
    firstName: 'James',
    lastName: 'Dean',
    password: 'itsASecretShh...'
};
```

#### Feature File: `scenarioOutline.feature`

```gherkin
Feature: Sign Up

  Scenario Outline: Submitting <prefix> Extra Emails
    Given the firstName text input value is $firstName
    And the lastName text input value is $lastName
    And the email text input value is $email
    And the password text input value is $password
    And the extraEmails checkbox input is <extraEmails>
    When the submit button is clicked
    Then POST /api/sign-up is called with the request body:
      """
       {
           "firstName": "$firstName",
           "lastName": "$lastName",
           "email": "$email",
           "password": "$password",
           "extraEmails": <extraEmailsValue>,
           "date": "2019-12-01T15:00:00.000Z"
       }
      """
    And the successAlert is <successAlert>
    And the showExtraEmailsAlert is <showExtraEmailsAlert>

    Examples:
      | prefix  | extraEmails | extraEmailsValue | successAlert | showExtraEmailsAlert |
      | With    | not checked | false            | visible      | not visible          |
      | Without | checked     | true             | visible      | visible              |
```

### Example With ENV & Nested Variables Structure

#### Testing Command:

```bash
ENV=qa $(npm bin)/jest
```

#### Variables File: `scenarioOutline.vars.qa.ts`

```typescript
export default {
    user: {
        email: 'james.dean@gmail.com',
        firstName: 'James',
        lastName: 'Dean',
        password: 'itsASecretShh...'
    }
};
```

#### Feature File: `scenarioOutline.feature`

```gherkin
Feature: Sign Up - Scenario Outline [Nested]

  Scenario Outline: Submitting <prefix> Extra Emails
    Given the firstName text input value is $user.firstName
    And the lastName text input value is $user.lastName
    And the email text input value is $user.email
    And the password text input value is $user.password
    And the extraEmails checkbox input is <extraEmails>
    When the submit button is clicked
    Then POST /api/sign-up is called with the request body:
      """
       {
           "firstName": "$user.firstName",
           "lastName": "$user.lastName",
           "email": "$user.email",
           "password": "$user.password",
           "extraEmails": <extraEmailsValue>,
           "date": "2019-12-01T15:00:00.000Z"
       }
      """
    And the successAlert is <successAlert>
    And the showExtraEmailsAlert is <showExtraEmailsAlert>

    Examples:
      | prefix  | extraEmails | extraEmailsValue | successAlert | showExtraEmailsAlert |
      | With    | not checked | false            | visible      | not visible          |
      | Without | checked     | true             | visible      | visible              |
```

\*\* to accessing properties, please use standard javascript property pathing.

### Examples

| Type                             | Feature File                                                                                   | Variable File                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Global Variables **Without** Env | [scenarioOutlineNestedGlobal](test/features/scenarioOutlineNestedGlobal.feature)       | [global.vars.ts](test/variables/global.vars.ts)                                       |
| Variables **Without** Env        | [scenarioOutline](test/features/scenarioOutline.feature)                               | [scenarioOutline.vars.ts](test/variables/scenarioOutline.vars.ts)                     |
| Global Variables **With** Env    | [scenarioOutlineNestedGlobalEnv](test/features/scenarioOutlineNestedGlobalEnv.feature) | [global.vars.dev.ts](test/variables/global.vars.dev.ts)                               |
| Variables **With** (dev)         | [scenarioOutlineNested](test/features/scenarioOutlineNested.feature)                   | [scenarioOutlineNested.vars.dev.ts](test/variables/scenarioOutlineNested.vars.dev.ts) |

### Variable File Rules

-   must be located within your project
-   uses an extension defined in your jest configuration: [**moduleFileExtensions**](https://jestjs.io/docs/en/configuration#modulefileextensions-arraystring)
-   can be parsed into a javascript object, eg. .js, .json, .ts
-   global files, as the name implies, can be used in any feature file
-   when providing an env, it will prioritize files with an env over those that do not. eg, ENV=dev = feature.vars.dev >
    feature.vars
-   global and feature specific variable files will get merged together into a single object.
-   when global and feature specific variable files have the same variable paths, the feature specific values will be
    prioritized.

## Cucumber Docs

Here are some useful links to the cucumber-js docs:

-   [after](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#afteroptions-fn)
-   [afterAll](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#afteralloptions-fn)
-   [before](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#beforeoptions-fn)
-   [beforeAll](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#beforealloptions-fn)
-   [beforeAll / afterAll example](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/hooks.md#beforeall--afterall)
-   [defineStep](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#definesteppattern-options-fn)
    , aka Given/When/Then (aliases)
-   [data tables](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/data_table_interface.md)
-   [expressions](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/step_definitions.md#cucumber-expressions)
-   [Hooks](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/hooks.md)
-   [setDefinitionFunctionWrapper](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#setdefinitionfunctionwrapperwrapper)
-   [setDefinitionFunctionWrapper example](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/step_definitions.md#definition-function-wrapper)
-   [setWorldConstructor](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#setworldconstructorconstructor)
-   [World](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/world.md)
