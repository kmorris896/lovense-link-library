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
    
    fetch("https://" + controlLinkDomain + "/c/" + this.shortURL)
      .then(function (res) {
        console.log("http status: " + res.status);
        if (res.status == "200") {  
          console.log("Location: " + res.url);
          var re = /(\w+$)/.test(res.url);
          this.sid = RegExp.$1
          console.log("SID Defined: " + this.sid);
        }
      })
      .then(function () {
        fetch("https://api.lovense.com/developer/v2/loading/" + this.sid)
          .then(function(res) { 
            res.json().then(function(json) {
              console.log(json);
              if (json.result === true) {
                this.toyType = json.data;
                this.validLink = true;
              } else {
                this.validLink = false;
              }
            });
          }); 
        });
  } else {
    console.log("No Lovense Link detected.");
    this.url = null;
  }
};

module.exports = LovenseLink;
