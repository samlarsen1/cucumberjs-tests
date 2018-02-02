# nodejs-cucumber-testing

Sample CucumberJS (NodeJS) project for integration testing.
Run this against either TRACES or the new TRACES.
Add BDD features & scenarios to these tests as part of stories.

## Prerequesites

* [Node.js](http://nodejs.org)
* [NPM](http://npmjs.org)
* [cucumber-js](https://github.com/cucumber/cucumber-js)
* [eslint](https://eslint.org/docs/user-guide/command-line-interface)

## How to use

* Install cucumber-js globally with:
``` shell
$ npm install -g cucumber
```
* Clone this repository
* Then install all required dependencies with `npm install --dev`
* Finally run the test `npm test`

## Structure

* `/features` - sample BDD feature tests
* `/soapui` - working soapui tests of traces SOAP api
* `/data` - sample SOAP XML Message Responses
