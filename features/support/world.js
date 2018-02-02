// features/support/world.js
const { setWorldConstructor } = require('cucumber')

var {defineSupportCode} = require('cucumber');


class CustomWorld {

  constructor() {
    this.type = 0;
    this.pollFrom = '';
    this.pollTo = '';
    this.tracesUrl = '';
    this.searchBody = '';
  }

  setType(string) {
    this.type = string;
  }

  setPollTo(string){
    this.pollTo = string;
  }

  setPollFrom(string){
    this.pollFrom = string;
  }

  search() {

    var request = require('request'),
        parseResponse = function(response) {
          return JSON.parse(response.getBody('utf8'));
        }

    var response = request('GET', self.tracesUrl, {
      headers: {
       'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: self.searchBody
    });

    var xml = parseResponse(response);
    if (response.statusCode !== 200) {
     throw Error('Unable to authenticate: ' + response.statusCode);
    }

    console.log(xml);
  }
}

setWorldConstructor(CustomWorld);

defineSupportCode(function({setWorldConstructor}) {
  setWorldConstructor(CustomWorld)
});
