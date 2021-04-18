import {setWorldConstructor} from '@cucumber/cucumber';

import Element from './utils/element';
import {$server, $spy} from './utils/mocks';

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

setWorldConstructor(TestWorld);
