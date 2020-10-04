const Lovense = require('./index.js');

// First Test: UUID Expansion
//   Take a lovense link and make sure the URL can be parsed
//   and grab it's SID

console.log("TEST 1: Regexp Parsing");
const lovenseLink = new Lovense("https://c.lovense.com/c/vier7z");

