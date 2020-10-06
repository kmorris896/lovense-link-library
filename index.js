const fetch = require('node-fetch');

// current link notation: https://c.lovense.com/c/abc123
const controlLinkDomain = 'c.lovense.com';
const controlLinkRegex = new RegExp("^https?://" + controlLinkDomain + "\/c\/(\\w+)", 'i');

class LovenseLink {
  constructor (url_in) {
    console.log("testing: " + url_in);
    this.ready = false;
    this.validLink = false;

    const linkMatch = controlLinkRegex.exec(url_in);
    if ((linkMatch != null) && (linkMatch.length > 1)) {
      this.url = linkMatch[0];
      this.shortURL = linkMatch[1];
    } else {
      this.url = url_in;
      this.validLink = false;
    }
  }

  async initialize() {
    await this.getSID();
    await this.getToyInfo();
    await this.heartbeat();
  }

  async getSID() {
    const res = await fetch("https://" + controlLinkDomain + "/c/" + this.shortURL);
    console.log("http status: " + res.status);
    if (res.status == "200") {  
      console.log("Location: " + res.url);
      const re = new RegExp("(\\w+)$");
      const reMatch = re.exec(res.url);
      // console.log(reMatch);
      this.sid = reMatch[1];
    }
  };

  async getToyInfo() {
    const res = await fetch("https://api.lovense.com/developer/v2/loading/" + this.sid);
    const json = await res.json();
    // console.log(json);
    if (json.result === true) {
      this.toyData = json.data;
      this.validLink = true;
    } 
    
    this.ready = true;
  }

  async heartbeat() {
    const offset = new Date().getTimezoneOffset() * 60;  // Return offset to seconds
    const unixtime = Date.now() + offset;
    const res = await fetch("https://" + controlLinkDomain + "/app/ws/loading/" + this.sid + "?_=" + unixtime);

    const json = await res.json();
    console.log("heartbeat: " + JSON.stringify(json));
  }
};

module.exports = LovenseLink;
