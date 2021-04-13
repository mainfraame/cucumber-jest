import {Then, When} from '@cucumber/cucumber';

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

Then('pass', function () {});
