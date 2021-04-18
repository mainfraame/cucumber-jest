import {Given, Then, When} from '@cucumber/cucumber';

import type {TestWorld} from './world';

Then('I say {word} and {string} and {string}', function (first, second, third) {
    expect(first).toEqual('"word"');
    expect(second).toEqual('string');
    expect(third).toEqual('string2');
});

Then('{int} plus {int} should equal {int}', function (num1, num2, sum) {
    expect(num1 + num2).toEqual(sum);
});

Then(
    /^I have a regex that should parse (\S+) and (\S+)$/,
    function (first, second) {
        expect(first).toEqual('string1');
        expect(second).toEqual('string2');
    }
);

Then('fail fast', function () {
    fail();
});

Given(/^the (\S+) component rendered$/, async function (this: TestWorld, name) {
    await this[name].click();
});

When('the {word} button is clicked', async function (this: TestWorld, name) {
    await this[name].click();

    await this[name].waitForEnabled();
});

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
    async function (this: TestWorld, method, url, type, value) {
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

Then('pass', function () {});
