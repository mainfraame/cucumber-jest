# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2021-02-11

### Changes

- refactored structure of project
- added support for node v10 [3fca142](https://github.com/mainfraame/cucumber-jest/commit/3fca142678131e871ee2422a150735c466d3acc3)
- added prettier, import sort, and husky to standardize code style on pre-commit [ac7128e](https://github.com/mainfraame/cucumber-jest/commit/ac7128e7e6bdc4c1d9059cf44cef22199d44820e)
- updated example project to support node v10

### Notes

- if you are having an issue with running this latest version, run jest clearCache:
```$(npm bin)/jest --clearCache```

## [0.1.1] - 2021-02-06

### Changes

- corrected typo referring to jest-cucumber, a different package in README [c172252](https://github.com/mainfraame/cucumber-jest/pull/2/commits/c1722520916c568f379e84405bea7805bbf8d5b5)
- updated parseFeature to work with cucumber-expressions [c14f97c](https://github.com/mainfraame/cucumber-jest/pull/2/commits/c14f97c8d6039daf6ae908e16f6f6a400beae3ac)

## [0.1.0] - 2021-01-31

### Added

- support for pathing on windows
- feature level (only) ***experimental*** tags support
- built in ***experimental*** tags: @skip, @debug

### Changes

- added documentation for tags
