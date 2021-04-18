Feature: Sign Up - Scenario Outline [Nested][Global Vars][W/ Env]

  Scenario Outline: Submitting <prefix> Extra Emails
    Given the firstName text input value is $global.firstName
    And the lastName text input value is $global.lastName
    And the email text input value is $global.email
    And the password text input value is $global.password
    And the extraEmails checkbox input is <extraEmails>
    When the submit button is clicked
    Then POST /api/sign-up is called with the request body:
      """
       {
           "firstName": "$global.firstName",
           "lastName": "$global.lastName",
           "email": "$global.email",
           "password": "$global.password",
           "extraEmails": <extraEmailsValue>,
           "date": "2019-12-01T15:00:00.000Z"
       }
      """
    And the successAlert is <successAlert>
    And the showExtraEmailsAlert is <showExtraEmailsAlert>

    Examples:
      | prefix  | extraEmails | extraEmailsValue | successAlert | showExtraEmailsAlert |
      | With    | not checked | false            | visible      | not visible          |
      | Without | checked     | true             | visible      | visible              |
