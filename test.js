const Lovense = require('./index.js');

// First Test: Regexp Parsing
//   Take a lovense link and make sure the URL can be parsed
console.log("TEST 1: Regexp Parsing");
const test_regexp = new Lovense("https://c.lovense.com/c/abc123");
console.log(test_regexp.shortURL);
if (test_regexp.shortURL === "abc123") {
    console.log("PASS");
} else {
    console.log("FAIL");
}
