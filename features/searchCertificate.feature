Feature: Simple certificate search
  In order to synchronise certificates
  As a service
  I want to query traces for new certificates

  Scenario Outline: simple CED certificate search
    Given a search for "<type>" certificates
    And the last datetime polled was "<poll_from>"
    And the current datetime is "<poll_to>"
    When a certificate request is performed
    And the certificate results are returned
    Then the number of certificates returned will be <result_count>

    Examples:
      | type | poll_from        | poll_to          | result_count |
      |  CED | 2015-01-01 10:00 | 2017-12-04 10:10 |            1 |
      |  CED | 2017-12-01 10:00 | 2017-12-04 10:10 |            0 |
