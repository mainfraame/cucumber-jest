import { setWorldConstructor } from 'cucumber';

import Element from './element';
import { $server, $spy } from './mocks';

// axios uses this library, which mutates a nodejs internal.
// when this occurs, jest will leak memory. since this isn't necessary we can mock it
jest.mock('follow-redirects', () => ({
    http: function () {
    },
    https: function () {
    }
}));

jest.setTimeout(1000000);

export class TestWorld {
    $server = $server;
    $spy = $spy;

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
