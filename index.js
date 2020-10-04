// const fetch = require('node-fetch');

// current link notation: https://c.lovense.com/c/abc123
const controlLinkDomain = 'c.lovense.com';
const controlLinkRegex = new RegExp("^h", 'i');
// const controlLinkRegex = new RegExp("^https?://" + controlLinkDomain + "\/c\/(\\w+)", 'i');

class LovenseLink {
  constructor(url) {
    console.log("testing: " + url);
    const foo = new RegExp("^https?://" + controlLinkDomain + "\/c\/(\\w+)", 'i');
    const linkMatch = foo.exec(url);
    if ((linkMatch != null) && (linkMatch.length > 1)) {
      this.url = linkMatch[0];
      this.shortURL = linkMatch[1];
    } else {
      console.log('No link detected.');
    }
  }
}

module.exports = LovenseLink;
