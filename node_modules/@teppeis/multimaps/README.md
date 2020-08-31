# @teppeis/multimaps

Multi-Map classes for TypeScript and JavaScript

[![npm version][npm-image]][npm-url]
![Node.js Version Support][node-version]
[![build status][circleci-image]][circleci-url]
[![dependency status][deps-image]][deps-url]
![License][license]

## Install

```console
$ npm i @teppeis/multimaps
```

## Usage

### `ArrayMultimap`

```js
import {ArrayMultimap} from '@teppeis/multimaps';

const map = new ArrayMultimap<string, string>();
map.put('foo', 'a');
map.get('foo'); // ['a']
map.put('foo', 'b');
map.get('foo'); // ['a', 'b']
map.put('foo', 'a');
map.get('foo'); // ['a', 'b', 'a']
```

### `SetMultimap`

```js
import {SetMultimap} from '@teppeis/multimaps';

const map = new SetMultimap<string, string>();
map.put('foo', 'a');
map.get('foo'); // a `Set` of ['a']
map.put('foo', 'b');
map.get('foo'); // a `Set` of ['a', 'b']
map.put('foo', 'a');
map.get('foo'); // a `Set` of ['a', 'b']
```

## License

MIT License: Teppei Sato &lt;teppeis@gmail.com&gt;

[npm-image]: https://img.shields.io/npm/v/@teppeis/multimaps.svg
[npm-url]: https://npmjs.org/package/@teppeis/multimaps
[npm-downloads-image]: https://img.shields.io/npm/dm/@teppeis/multimaps.svg
[deps-image]: https://img.shields.io/david/teppeis/multimaps.svg
[deps-url]: https://david-dm.org/teppeis/multimaps
[node-version]: https://img.shields.io/badge/Node.js%20support-v6,v8,v10-brightgreen.svg
[license]: https://img.shields.io/npm/l/@teppeis/multimaps.svg
[circleci-image]: https://circleci.com/gh/teppeis/multimaps.svg?style=shield
[circleci-url]: https://circleci.com/gh/teppeis/multimaps
