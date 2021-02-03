import { Given, Then, When } from 'cucumber';

import './world';
import { TestWorld } from './world';

Given(/^the (\S+) component rendered$/, async function (this: TestWorld, name) {
    await this[name].click();
});

When('the {word} button is clicked', async function (this: TestWorld, name) {

    await this[name].click();

    await this[name].waitForEnabled();
});

When(/^the (\S+) text input value is (.*)$/, async function (this: TestWorld, name, value) {
    await this[name].setValue(value);
});

When(/^the (\S+) checkbox input is (checked|not checked)$/, async function (this: TestWorld, name, state) {

    const currentValue = this[name].getAttribute('checked');

    if (currentValue !== (state === 'checked')) {

        await this[name].click();
    }
});

Then(/^(GET|PUT|POST|DELETE) (.*) is called with the (request body|params):$/,
    function (this: TestWorld, method, url, type, value) {

        const hasBody = type === 'request body';

        expect(this.$spy).toHaveBeenCalledWith({
            url,
            method,
            ...hasBody ? {data: value} : {params: value}
        });
    }
);

Then(/^the (\S+) is (visible|not visible)$/, async function (this: TestWorld, name, state) {

    await this[name][state === 'visible' ? 'waitForInDom' : 'waitForNotInDom']();

    expect(this[name].isInDom()).toEqual(state === 'visible');
});

Then(/^the (\S+) inner text is "(.*)"$/, function (this: TestWorld, name, innerText) {

    expect(this[name].innerText()).toEqual(innerText);
});
