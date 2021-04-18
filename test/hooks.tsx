import {After, AfterAll, BeforeAll} from '@cucumber/cucumber';
import {advanceTo, clear} from 'jest-date-mock';
import React from 'react';
import ReactDOM from 'react-dom';
import {act} from 'react-dom/test-utils';

import {SignUp} from './example/src/signUp';
import {TestWorld} from './world';

const $root = document.createElement('div');

document.body.appendChild($root);

BeforeAll(async function (this: TestWorld) {
    this.$server.listen();

    advanceTo(new Date('2019-12-01T15:00:00.000Z'));

    act(() => {
        ReactDOM.render(<SignUp />, $root);
    });
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
