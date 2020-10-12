require('dotenv').config();
const Lovense = require('./index.js');
const fetch = require('node-fetch');

const lovenseAPIToken = process.env.LOVENSETOKEN;
const lovenseToyId = process.env.LOVENSETOYID;
const lovenseLinkShortURL = process.env.SHORTURL

async function testLovenseInitialization() {
  return true;
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

    terminateTest(response);
  }

  return json;
}

async function testLink(shortURL, testResponseObject = {}) {
  var response = {};

  // Create lovenseLink Class and let's test this baby
  const lovenseLink = new Lovense(shortURL);
  console.log("shortURL: " + lovenseLink.shortURL);

  // initialize all of the other properties
  await lovenseLink.initialize();

  // if the lovenseLink isn't queued then the test fails anyway
  if (lovenseLink.status !== "queue") {
    response.statusCode = 401;
    response.body = "lovenseLink " + lovenseLink.shortURL + " was not queued and therefore will not pass further tests.";

    return response;
  } else {
    // If we're testing against a known testResponseObject, then let's test everything
    if (testResponseObject.hasOwnProperty("data") && testResponseObject.data.hasOwnProperty("sid")) {
      if (lovenseLink.sid === testResponseObject.sid) {
        console.log("SID (" + lovenseLink.sid + ") match: passed");
      } else {
        response.statusCode = 402;
        response.body = "testResponseObject.sid (" + testResponseObject.sid + ") and Link SID (" + lovenseLink.sid + ") match: FAILED";

        return response;
      }
    }
  }

  // test toyType
  if (testResponseObject.hasOwnProperty("data")) {
    // Test 2: make sure the toy matches
    // Tests will always be toyType lush
    if (lovenseLink.toyData.toyType === "lush") {
      console.log("toyType (" + lovenseLink.toyData.toyType + ") match: passed");
    } else {
      response.statusCode = 403;
      response.body = "Link toyType " + lovenseLink.toyData.toyType + " === lush match: FAILED";
  
      return response;
    }
  } else {
    console.log("INFO ONLY: toyType (" + lovenseLink.toyData.toyType + ")");
  }


  // If all tests pass:
  response.body = "OK-READY";
  response.statusCode = 200;

  return response;
}

async function testControl(shortURL) {
  const lovenseLink = new Lovense(shortURL);
  await lovenseLink.initialize();

  console.log("testControl: lovenseLink.status = " + lovenseLink.status);
  if (lovenseLink.status === "queue") {
    await lovenseLink.consumeLink();
    await lovenseLink.beginLinkMonitor()
  }
}

function terminateTest(response_object) {
  console.log("terminateTest: " + response_object);
  if (results.statusCode !== 200) {
    process.exit(result.statusCode);
  } else {
    process.exit();
  }
}

// --- MAIN --- //
if (typeof lovenseAPIToken !== "undefined") {
  testLovenseInitialization()
    .then(async function (results) {
      // await testLink(results.data.controlLink, results);
    })
    .then(async function () {
      if (typeof lovenseLinkShortURL !== "undefined") {
        console.log("Got shortURL; running testControl.");
        await testLink(lovenseLinkShortURL);
        await testControl(lovenseLinkShortURL);

        console.log("Done.");
      }
    });

} else {
  console.log("lovenseAPIToken is undefined.");
  process.exit(1);
}
