Feature: cucumber-jest cucumber expressions and regex

  Scenario: cucumber-jest should correctly parse cucumber expressions {word} and {string}
    Then I say "word" and "string" and "string2"

  Scenario: cucumber-jest should correctly parse regex expressions
    Then I have a regex that should parse string1 and string2