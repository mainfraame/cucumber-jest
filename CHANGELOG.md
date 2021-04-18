# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2021-04-18

### Added

-   added developer tooling
-   added tests; thanks to the addition from [kevincmanning](https://github.com/mainfraame/cucumber-jest/issues?q=is%3Apr+author%3Akevincmanning)

### Changes

-   moved example project inside of test folder
-   modified jest config for project to run tests against example project
-   fixed cucumber expression [71ae22b](https://github.com/mainfraame/cucumber-jest/commit/71ae22b53924e0bccd11a14d503dbc342e6fb40f)

## [0.2.4] - 2021-03-01

### Added

-   added better error messaging for missing steps that includes a generic implementation snipped [46c4102](https://github.com/mainfraame/cucumber-jest/commit/46c41021fc90587a175317987aad018caa782124)

## [0.2.3] - 2021-02-24

### Added

-   added `babel-macros-plugin`
-   environment variable to have cucumber-jest print out the path to the temp directory `CUCUMBER_JEST_SHOW_TEMP_PATH`

### Changes

-   refactored glob patterns used for getting variable file paths **[PERFORMANCE](https://github.com/mainfraame/cucumber-jest/issues/10)**
-   replaced prototyped methods (filter, find, map, reduce, etc.) with `inline-loops.macro` **[PERFORMANCE](https://github.com/mainfraame/cucumber-jest/issues/10)**

## [0.2.2] - 2021-02-19

### Added

-   added error handling and error message formatting when a feature file fails to parse (error from cucumber)
-   prioritizing variable files based on ENV
-   merging global and feature variable files; prioritizing values of feature variables over global variables (if matching)

### Changes

-   fixed variables regexp to account for exact matches, double quote wrapping and escaping pipe characters when in a data table,
-   made global and feature specific variable files follow the same naming convention; eg. {global/feature}.vars.**{env}**.{ext}
-   updated README with convention change and included path of temporary folder for feature files with variables

## [0.2.1] - 2021-02-18

### Added

-   support for a global variable files with and without env defined

## [0.2.0] - 2021-02-16

### Changes

-   **[BREAKING]** upgraded [cucumber](https://github.com/cucumber/cucumber-js) to version
    7.0.0 [7028559](https://github.com/mainfraame/cucumber-jest/commit/7028559b4fd6391a0f60fdd7dfd9a0fd0508d76b)
    ```typescript
    import {
        After,
        AfterAll,
        Before,
        BeforeAll,
        Given,
        Then,
        When,
        setWorldConstructor
    } from '@cucumber/cucumber';// <-- version 7.0.0
    // from 'cucumber';            <-- version 6.0.0
    ```
-   loosened package dependency version restrictions
-   removed unused/broken logic for "un-mocking" manual mocks

## [0.1.3] - 2021-02-11

### Changes

-   fixed regression with node v10 fix

## [0.1.2] - 2021-02-11

### Changes

-   added support for node
    v10 [3fca142](https://github.com/mainfraame/cucumber-jest/commit/3fca142678131e871ee2422a150735c466d3acc3)
-   added prettier, import sort, and husky to standardize code style on
    pre-commit [ac7128e](https://github.com/mainfraame/cucumber-jest/commit/ac7128e7e6bdc4c1d9059cf44cef22199d44820e)
-   refactored structure of
    project [ba4c840](https://github.com/mainfraame/cucumber-jest/commit/ba4c840ce6f4e477b5d2501ced061b8033ebe13d)
-   updated example project to support node
    v10 [ba4c840](https://github.com/mainfraame/cucumber-jest/commit/ba4c840ce6f4e477b5d2501ced061b8033ebe13d)

### Notes

-   if you had a previous version installed and are having issues running this version, run jest clearCache:
    `$(npm bin)/jest --clearCache`

## [0.1.1] - 2021-02-06

### Changes

-   corrected typo referring to jest-cucumber, a different package in
    README [c172252](https://github.com/mainfraame/cucumber-jest/pull/2/commits/c1722520916c568f379e84405bea7805bbf8d5b5)
-   updated parseFeature to work with
    cucumber-expressions [c14f97c](https://github.com/mainfraame/cucumber-jest/pull/2/commits/c14f97c8d6039daf6ae908e16f6f6a400beae3ac)

## [0.1.0] - 2021-01-31

### Added

-   support for pathing on windows
-   feature level (only) **_experimental_** tags support
-   built in **_experimental_** tags: @skip, @debug

### Changes

-   added documentation for tags
