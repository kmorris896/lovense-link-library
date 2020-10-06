require('dotenv').config();
const Lovense = require('./index.js');
const fetch = require('node-fetch');

console.log(process.env);

const lovenseAPIToken = process.env.LOVENSETOKEN;
const lovenseToyId = process.env.LOVENSETOYID;

async function testLovense() {
  // Let's first create a test link:
  const url = 'https://api.lovense.com/developer/v2/createSession?token=' + lovenseAPIToken 
    + '&customerid=lovenseLinkLibrary&toyId=' + lovenseToyId + '&toyType=lush';
  console.log(url);
  const res = await fetch(url);
  const json = await res.json();
  var response = {};

  // If we're unable to make a link, then there is no point in continuing.
  if (json.result !== true) {
    response.statusCode = 400;
    response.body = "Unable to generate custom link: " + json.message;

    return response;
  }

  // Create lovenseLink Class and let's test this baby
  const lovenseLink = new Lovense(json.data.controlLink);
  console.log("shortURL: " + lovenseLink.shortURL);

  // initialize all of the other properties
  const foo = await lovenseLink.initialize();

  // Test 1: make sure the sid from the link matches the sid from the API call
  if (lovenseLink.sid === json.data.sid) {
    console.log("SID (" + lovenseLink.sid + ") match: passed");
  } else {
    const errorMsg = "json.data.sid (" + json.data.sid + ") and Link SID (" + lovenseLink.sid + ") match: FAILED";
    response.body = errorMsg;
    response.statusCode = 401;

    return response;
  }

  // Test 2: make sure the toy matches
  if (lovenseLink.toyData.toyType === "lush") {
    console.log("toyType (" + lovenseLink.toyData.toyType + ") match: passed");
  } else {
    const errorMsg = "json.toyData.toyType (" + json.toyData.toyType + ") and Link SID (lush) match: FAILED";
    response.body = errorMsg;
    response.statusCode = 402;

    return response;
  }


  // If all tests pass:
  response.body = "OK-READY";
  response.statusCode = 200;

  return response;
}

if (typeof lovenseAPIToken !== "undefined") {
  testLovense()
    .then(function (results) {
      console.log(results);
      if (results.statusCode !== 200) {
        process.exit(result.statusCode);
      }
    });
} else {
  console.log("lovenseAPIToken is undefined.");
  process.exit(1);
} 