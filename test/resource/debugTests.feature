Feature: debug tests

  Scenario: should not execute
    Then fail fast

  @debug
  Scenario: only execute this test
    Then pass