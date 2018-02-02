/**
 * certificate search
 */
const defineSupportCode = require('cucumber').defineSupportCode;
const expect = require('chai').expect;
const request = require('sync-request');
const Sequence = require('sequence').Sequence;
const sleep = require('system-sleep');

defineSupportCode(function({ Given, Then, When }) {

    let searchType = '';
    let pollInterval = 2000;
    let pollFrom = '';
    let pollTo = '';
    let tracesSearchUrl = 'https://webgate.training.ec.europa.eu/sanco/traces_ws/searchCertificate';
    let tracesPollUrl = 'https://webgate.training.ec.europa.eu/sanco/traces_ws/pollSearchCertificateResult'
    let tracesSearchBody = '\
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:trac="traceswsns">\
   <soapenv:Header/>\
   <soapenv:Body>\
      <trac:CertificateRequest>\
         <trac:XMLSchemaVersion>2.0</trac:XMLSchemaVersion>\
         <trac:UserIdentification>BIP.GB@traces-cbt.net</trac:UserIdentification>\
         <trac:UserPassword>BIP.GB</trac:UserPassword>\
         <trac:SendingDate>2017-12-05 16:55</trac:SendingDate>\
         <trac:Request>\
            <trac:SearchCriterion_SEARCH_TYPE>\
               <trac:ModifiedBetween>\
                  <trac:StartDate>_START_DATE</trac:StartDate>\
                  <trac:EndDate>_END_DATE</trac:EndDate>\
               </trac:ModifiedBetween>\
               <trac:CountryOfDestination>GB</trac:CountryOfDestination>\
               <trac:FetchAmount>10</trac:FetchAmount>\
            </trac:SearchCriterion_SEARCH_TYPE>\
         </trac:Request>\
      </trac:CertificateRequest>\
   </soapenv:Body>\
</soapenv:Envelope>';
    let tracesPollBody = '\
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:trac="traceswsns">\
   <soapenv:Header/>\
   <soapenv:Body>\
      <trac:CertificatePoll>\
        <trac:XMLSchemaVersion>2.0</trac:XMLSchemaVersion>\
        <trac:UserIdentification>BIP.GB@traces-cbt.net</trac:UserIdentification>\
        <trac:UserPassword>BIP.GB</trac:UserPassword>\
        <trac:SendingDate>2017-12-05 16:55</trac:SendingDate>\
        <trac:RequestIdentifier>REQUEST_IDENTIFIER</trac:RequestIdentifier>\
      </trac:CertificatePoll>\
   </soapenv:Body>\
</soapenv:Envelope>';
    let requestIdentifier = 0;
    let certificates = [];

    Given('a search for {string} certificates', function(input, callback) {
        searchType = input.replace(/"/g,'');
        callback();
    });

    Given('the last datetime polled was {string}',function(input,callback){
        pollFrom = input.replace(/"/g,'');
        callback();
    });

    Given('the current datetime is {string}',function(input,callback){
        pollTo = input.replace(/"/g,'');
        callback();
    });

    When('a certificate request is performed', {timeout: 30000}, function(callback) {

        //  string replacements in POST body
        var replacements = {
          _START_DATE: pollFrom,
          _END_DATE: pollTo,
          _SEARCH_TYPE: searchType
        }
        Sequence.create()
          .then(function(next) {
            //console.log("   Search");
            //  make certificate search
            var res, operationCode,
                opCodeRegex = /<OperationCode>(\d+)<\/OperationCode>/g,
                req = request('POST', tracesSearchUrl, {
                body: tracesSearchBody.replace(/_START_DATE|_END_DATE|_SEARCH_TYPE/g,function(matched){
                  return replacements[matched];
                }
              ),
              headers: { 'Content-Type': 'text/xml' }
            });

            res = req.getBody('utf8');

            operationCode = res.search(opCodeRegex)>-1? opCodeRegex.exec(res)[1] : null;
            //  to test for different failure codes, elaborate this section
            // if (operationCode === 0){
            //  // success
            // } else if (operationCode === 10){
            //  //  busy
            // } else {
            //
            // }
            expect(operationCode).to.equal('0','Invalid OperationCode');

            //  extract request identifier from response
            var reqIdRegex = /<RequestIdentifier>(\d+)<\/RequestIdentifier>/g;
            requestIdentifier = res.search(reqIdRegex)>-1? parseInt(reqIdRegex.exec(res)[1]) : null;
            //  check identifier is valid
            expect(requestIdentifier).to.be.above(0,'Invalid RequestIdentifier');
            //console.log("   Search - valid response");
            next();
          })
          .then(function() {

            var res,
                operationCode = '',
                opCodeRegex = /<OperationCode>(\d+)<\/OperationCode>/g,
                body = tracesPollBody.replace('REQUEST_IDENTIFIER',requestIdentifier);
            for(var i=0;i<5;i++){
              //console.log("   Wait");
              sleep(pollInterval);
              //console.log("   Polling");
              //  make certificate poll request
              var req = request('POST', tracesPollUrl, {
                body: body,
                headers: { 'Content-Type': 'text/xml' }
              });
              res = req.getBody('utf8');

              //  check for successful response
              opCodeRegex.lastIndex = 0;
              operationCode = res.search(opCodeRegex)>-1? opCodeRegex.exec(res)[1] : null;
              //console.log("    OperationCode="+operationCode);
              if(operationCode === '0'){
                //console.log("   Polling - valid response");
                break;
              }
            }

            expect(operationCode).to.equal('0','Invalid OperationCode');
            //  extract certificates
            var certificateRegex = /<CED>(.+)<\/CED>/g;
            certificates = res.match(certificateRegex) || [];
            callback();
          })
    });

    When('the certificate results are returned', function(callback) {
        //  check certificates are present
        expect(certificates).to.be.a('array');
        callback();
    });

    Then('the number of certificates returned will be {int}', function(input, callback) {
        //  check certificates are present
        expect(certificates).to.have.lengthOf(input);
        callback();
    });
});
