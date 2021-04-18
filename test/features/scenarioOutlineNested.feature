Feature: Sign Up - Scenario Outline [Nested]

  Scenario Outline: Submitting <prefix> Extra Emails
    Given the firstName text input value is $user.firstName
    And the lastName text input value is $user.lastName
    And the email text input value is $user.email
    And the password text input value is $user.password
    And the extraEmails checkbox input is <extraEmails>
    When the submit button is clicked
    Then POST /api/sign-up is called with the request body:
      """
       {
           "firstName": "<firstName>",
           "lastName": "$user.lastName",
           "email": "$user.email",
           "password": "$user.password",
           "extraEmails": <extraEmailsValue>,
           "date": "2019-12-01T15:00:00.000Z"
       }
      """
    And the successAlert is <successAlert>
    And the showExtraEmailsAlert is <showExtraEmailsAlert>

    Examples:
      | prefix  | firstName       | extraEmails | extraEmailsValue | successAlert | showExtraEmailsAlert |
      | With    | $user.firstName | not checked | false            | visible      | not visible          |
      | Without | $user.firstName | checked     | true             | visible      | visible              |
