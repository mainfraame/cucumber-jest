# cucumber-jest
[![Build Passing](https://img.shields.io/badge/build-passing-green.svg)](https://github.com/Naereen/badges) [![Build Passing](https://img.shields.io/badge/dependencies-up_to_date-green.svg)](https://github.com/Naereen/badges)

A jest transformer for executing cucumber tests

```bash
npm i cucumber-jest -D
```

## Table of Contents

- [Gherkin Features](#gherkin-features)

- [Cucumber Features](#cucumber-features)

- [Getting Started](#getting-started)

    - [Jest Config](#jest-config)
        
    - [Example](#example)   
        - [Feature](#feature)
        - [Hooks](#hooks)
        - [Steps](#steps)
        - [World](#world)
        
    - [Additional Features](#additional-features)   
        - [Gherkin Variables](#gherkin-variables)
   
## Gherkin Features

| Supported          | Feature                                                                                                                                                           | Notes                                                                      | 
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| :white_check_mark: | [And](https://cucumber.io/docs/gherkin/reference/#steps)                                                                                                          |                                                                            |
| :white_check_mark: | [Background](https://cucumber.io/docs/gherkin/reference/#background)                                                                                              |                                                                            |
| :white_check_mark: | [But](https://cucumber.io/docs/gherkin/reference/#steps)                                                                                                          |                                                                            |
| :white_check_mark: | [Comments](https://cucumber.io/docs/gherkin/reference/#descriptions)                                                                                              |                                                                            |
| :white_check_mark: | [Data Table](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/data_table_interface.md)                                                      |                                                                            |
| :white_check_mark: | [DocString](http://rmpestano.github.io/cukedoctor/cucumber-js/cucumber-js-documentation.html#_steps_accepting_a_docstring_parameter)                              | if it finds the docString is JSON, it will parse it for you             |
|                    | [Rule](https://cucumber.io/docs/gherkin/reference/#rule)                                                                                                          | haven't seen examples of this; not sure if it's worth it                   |
| :white_check_mark: | [Scenario](https://cucumber.io/docs/gherkin/reference/#descriptions)                                                                                              |                                                                            |
| :white_check_mark: | [Scenario Outline](http://rmpestano.github.io/cukedoctor/cucumber-js/cucumber-js-documentation.html#Scenario-Outlines-and-Examples)                               |                                                                            |


## Cucumber Features

| Supported          | Feature                                                                                                                                                           | Notes                                                                      | 
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| :white_check_mark: | [After](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#afteroptions-fn)                                                  | called after each scenario in a feature file                               |
| :white_check_mark: | [AfterAll](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#afteralloptions-fn)                                            | called after the feature file is completed; unlike Cucumber, you will have access to "this" context here.                                  |
|                    | [Attachments](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/attachments.md)                                                              |                                                                            |
| :white_check_mark: | [Before](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#beforeoptions-fn)                                                | called before each scenario per feature file                               |
| :white_check_mark: | [BeforeAll](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#beforealloptions-fn)                                          | called before the feature file is started; unlike Cucumber, you will have access to "this" context here.                                  |
| :white_check_mark: | [Given](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#givenpattern-options-fn)                                          |                                                                            |
|                    | [setDefaultTimeout](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#setdefaulttimeoutmilliseconds)                        | use jest.setTimeout or set the timeout property in your jest config        |
| :white_check_mark: | [setDefinitionFunctionWrapper](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#setdefinitionfunctionwrapperwrapper)       |                                                                            |
| :white_check_mark: | [setWorldConstructor](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#setworldconstructorconstructor)                     |                                                                            |
|                    | [Tags](https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#tags)                                                                                      | need to identify a way to pass tags through jest                           |
| :white_check_mark: | [Then](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#thenpattern-options-fn)                                            |                                                                            |
| :white_check_mark: | [When](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/api_reference.md#whenpattern-options-fn)                                            |                                                                            |


## Additional Features

| Supported          | Feature                                                                                                                                                           | Notes                                                                      | 
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| :white_check_mark: | [gherkin variables](#gherkin-variables) used to populate feature files                                                                                                     |                                                                            |


## Getting Started

### Jest Config

You'll need to add the following to your jest config:

### moduleFileExtensions:
```json
{
  "moduleFileExtensions": [
    "feature", // <--- *1
    "js",
    "json",
    "ts",
    "tsx"
  ],
  "setupFilesAfterEnv": [
    "<rootDir>/node_modules/cucumber-jest/dist/init.js", // <--- *2
    "<rootDir>/test/world.ts",
    "<rootDir>/test/hooks.tsx",
    "<rootDir>/test/steps.ts"
  ],
  "transform": {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
    "^.+\\.(feature)$": "jest-cucumber" // <--- *3
  },
  "testMatch": [
    "<rootDir>/path/to/your/*.feature" // <--- *4
  ],
  "testTimeout": 60000,
  "testURL": "http://127.0.0.1/",
  "verbose": true
}

```

1. Add ```feature``` to *moduleFileExtensions*
2. Add ```"<rootDir>/node_modules/cucumber-jest/dist/init.js"``` to *setupFilesAfterEnv*
   - this file calls cucumber's *supportCodeLibraryBuilder.reset* which sets up cucumber to start capturing registered hooks / steps
   - it's important to note that this file must be list first in the *setupFilesAfterEnv* list of files; before your world, hooks, or step files
3. Add ```"^.+\\.(feature)$": "jest-cucumber"``` as a *transformer*
4. Add ```"<rootDir>/path/to/your/*.feature"``` as a *testMatch* pattern

## Example

### Feature

```path/to/your/features/button.feature```

```feature
Feature: Button

Given I go to home
When I click the login button
Then the login button is not visible
```

### Hooks

```path/to/your/hooks.tsx```

```typescript
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils'
import { AfterAll, BeforeAll } from 'cucumber';

import SignUp from './path/to/your/app';

BeforeAll(async function () {
    await act(async () => {
        ReactDOM.render(
            <SignUp/>,
            document.body
        )
    });
});

AfterAll(async function () {
    await act(async () => {
        ReactDOM.unmountComponentAtNode(
            document.body
        )
    });
});
```

You can choose to use the hooks to render/unmount your component before/after each feature file like above,
or you can add a path to your application entry point to your jest configuration's [setupFiles](https://jestjs.io/docs/en/configuration#setupfiles-array) property. 
The latter is more performant.
    
### Steps

```path/to/your/steps.ts```

```typescript
import { Given, When, Then } from 'cucumber';
import { act } from 'react-dom/test-utils';

Given(/I go to (.*)$/, function(link) {
    window.location.hash = `#/${link}`;
});

When(/I click the (\S+) button$/, async function(name) {
    await act(async () => {
        document.querySelector(`[data-test-id="${name}"]`).click();
    });
});

Then(/the (\S+) button is (visible|not visible)$/, function(name, state) {
    expect(!!document.querySelector(`[data-test-id="${name}"]`))
        .toEqual(state === 'visible')
});
```

### World

[setWorldConstuctor](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/world.md) allows you to set the context of "this" for your steps/hooks definitions. 
This can be helpful when you want to maintain state between steps/hooks or want your steps/hooks to have access 
to some predefined data. The values are accessible within all Hooks, and Steps by using *this*

```path/to/your/world.ts```

```typescript
import { setWorldConstructor } from 'cucumber';

setWorldConstructor(
    class MyWorld {
        pages = [];
    }
);
```

### Output

Below is an example output from running tests against the [example](https://github.com/mentierd/pekel/tree/master/examples/basic/test)
```text
 PASS  test/features/scenarioOutline.feature (97 MB heap size)
  Feature: Sign Up - Submitting With Extra Emails
    ✓ Given the firstName text input value is Dayne (37 ms)
    ✓ And the lastName text input value is Mentier (11 ms)
    ✓ And the email text input value is dayne.mentier@gmail.com (13 ms)
    ✓ And the password text input value is itsASecretShh... (9 ms)
    ✓ And the extraEmails checkbox input is not checked (2 ms)
    ✓ When the submit button is clicked (89 ms)
    ✓ Then POST http://127.0.0.1:8080/api/sign-up is called with the request body: (3 ms)
    ✓ And the successAlert is visible (2 ms)
    ✓ And the showExtraEmailsAlert is not visible (2 ms)
  Feature: Sign Up - Submitting Without Extra Emails
    ✓ Given the firstName text input value is Dayne (12 ms)
    ✓ And the lastName text input value is Mentier (11 ms)
    ✓ And the email text input value is dayne.mentier@gmail.com (8 ms)
    ✓ And the password text input value is itsASecretShh... (10 ms)
    ✓ And the extraEmails checkbox input is checked (9 ms)
    ✓ When the submit button is clicked (45 ms)
    ✓ Then POST http://127.0.0.1:8080/api/sign-up is called with the request body: (1 ms)
    ✓ And the successAlert is visible (1 ms)
    ✓ And the showExtraEmailsAlert is visible (1 ms)

 PASS  test/features/scenario.feature (93 MB heap size)
  Feature: Sign Up - Without Extra Emails
    ✓ Given the firstName text input value is Dayne (11 ms)
    ✓ And the lastName text input value is Mentier (12 ms)
    ✓ And the email text input value is dayne.mentier@gmail.com (11 ms)
    ✓ And the password text input value is itsASecretShh... (14 ms)
    ✓ When the submit button is clicked (66 ms)
    ✓ Then POST http://127.0.0.1:8080/api/sign-up is called with the request body: (5 ms)
    ✓ And the successAlert is visible (2 ms)
    ✓ And the showExtraEmailsAlert is not visible (2 ms)
  Feature: Sign Up - With Extra Emails
    ✓ Given the firstName text input value is Dayne (14 ms)
    ✓ And the lastName text input value is Mentier (12 ms)
    ✓ And the email text input value is dayne.mentier@gmail.com (12 ms)
    ✓ And the password text input value is itsASecretShh... (9 ms)
    ✓ And the extraEmails checkbox input is checked (9 ms)
    ✓ When the submit button is clicked (49 ms)
    ✓ Then POST http://127.0.0.1:8080/api/sign-up is called with the request body: (1 ms)
    ✓ And the successAlert is visible (2 ms)
    ✓ And the showExtraEmailsAlert is visible (1 ms)

 PASS  test/features/scenarioBackground.feature (85 MB heap size)
  Feature: Sign Up - Without Extra Emails
    ✓ Given the firstName text input value is Dayne (14 ms)
    ✓ And the lastName text input value is Mentier (13 ms)
    ✓ And the email text input value is dayne.mentier@gmail.com (15 ms)
    ✓ And the password text input value is itsASecretShh... (22 ms)
    ✓ When the submit button is clicked (66 ms)
    ✓ Then POST http://127.0.0.1:8080/api/sign-up is called with the request body: (3 ms)
    ✓ And the successAlert is visible (4 ms)
    ✓ And the showExtraEmailsAlert is not visible (2 ms)
  Feature: Sign Up - With Extra Emails
    ✓ Given the firstName text input value is Dayne (10 ms)
    ✓ And the lastName text input value is Mentier (8 ms)
    ✓ And the email text input value is dayne.mentier@gmail.com (10 ms)
    ✓ And the password text input value is itsASecretShh... (8 ms)
    ✓ And the extraEmails checkbox input is checked (7 ms)
    ✓ When the submit button is clicked (46 ms)
    ✓ Then POST http://127.0.0.1:8080/api/sign-up is called with the request body:
    ✓ And the successAlert is visible (2 ms)
    ✓ And the showExtraEmailsAlert is visible (1 ms)

Test Suites: 3 passed, 3 total
Tests:       52 passed, 52 total
Snapshots:   0 total
Time:        7.603 s
Ran all test suites.
```

## Additional Features

### Restore Mocks

To automatically unmock files that use the ```__mocks__``` technique, simply add ```restoreMocks
to your jest configuration.

If you want to pass a list of mock files to keep, set the environment variable ```KEEP_MOCKS``` with a stringified array of paths.

### Gherkin Variables

This provides the ability to define variables in your feature files, and hold the values in a [separate file](https://github.com/mentierd/pekel/tree/master/examples/basic/features/scenarioOutline.vars.ts).
A few things to note for this functionality is:

1. the file must contain the same name as the feature file you're looking to populate
2. all variables start with a "$"; eg, in the feature file, the variable would be defined as *$email*, while the vars file would contain *email*
3. you can further split up your vars files by using the *ENV* variable (extension can be .json, .js, .ts). Using that, your files would look like this (assuming ENV = "dev"):
```featureFileName.dev.vars.ts```
   
For an example, see the example [scenarioOutline](https://github.com/mentierd/pekel/blob/master/examples/basic/test/features/scenarioOutline.feature) feature file, 
and the accompanying [variable file](https://github.com/mentierd/pekel/tree/master/examples/basic/test/features/scenarioOutline.vars.ts)
