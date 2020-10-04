const fetch = require('node-fetch');

// current link notation: https://c.lovense.com/c/abc123
const controlLinkDomain = 'c.lovense.com';
const controlLinkRegex = new RegExp("^https?://" + controlLinkDomain + "\/c\/(\\w+)", 'i');

function LovenseLink(url_in) {
  console.log("testing: " + url_in);
  const linkMatch = controlLinkRegex.exec(url_in);
  if ((linkMatch != null) && (linkMatch.length > 1)) {
    this.url = linkMatch[0];
    this.shortURL = linkMatch[1];
    
    const res = fetch("https://" + controlLinkDomain + "/c/" + this.shortURL)
      .then(function (res) {
        console.log("http status: " + res.status);
        console.log(JSON.stringify(res, null, 2));
        if (res.status == "200") {  
          console.log("Location: " + res.url);
          var re = /(\w+$)/.test(res.url);
          this.sid = RegExp.$1
          console.log(this.sid);
        }
      });
  } else {
    console.log("No Lovense Link detected.");
    this.url = null;
  }
};

module.exports = LovenseLink;
