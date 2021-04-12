import {Given} from '@cucumber/cucumber';

Given(
    'I say {word} and {string} and {string}',
    function (first, second, third) {
        expect(first).toEqual('"word"');
        expect(second).toEqual('string');
        expect(third).toEqual('string2');
    }
);
