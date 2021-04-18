Feature: Sign Up W/ Background & Tags Example

  Background:
    Given the firstName text input value is James
    And the lastName text input value is Dean
    And the email text input value is james.dean@gmail.com
    And the password text input value is itsASecretShh...

  @skip
  Scenario: Without Extra Emails
    When the submit button is clicked
    Then POST /api/sign-up is called with the request body:
      """
       {
           "firstName": "James",
           "lastName": "Dean",
           "email": "james.dean@gmail.com",
           "password": "itsASecretShh...",
           "extraEmails": false,
           "date": "2019-12-01T15:00:00.000Z"
       }
      """
    And the successAlert is visible
    And the showExtraEmailsAlert is not visible

  @withExtraEmail
  Scenario: With Extra Emails
    And the extraEmails checkbox input is checked
    When the submit button is clicked
    Then POST /api/sign-up is called with the request body:
      """
       {
           "firstName": "James",
           "lastName": "Dean",
           "email": "james.dean@gmail.com",
           "password": "itsASecretShh...",
           "extraEmails": true,
           "date": "2019-12-01T15:00:00.000Z"
       }
      """
    And the successAlert is visible
    And the showExtraEmailsAlert is visible
