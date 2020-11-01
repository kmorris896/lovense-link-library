const fetch = require('node-fetch');

// current link notation: https://c.lovense.com/c/abc123
const controlLinkDomain = 'c.lovense.com';
const controlLinkRegex = new RegExp("^https?://" + controlLinkDomain + "\/c\/(\\w+)", 'i');

class LovenseLink {
  constructor (url_in) {
    console.log("Constructing LovenseLink Class with this URL: " + url_in);
    this.status = "invalid";

    const linkMatch = controlLinkRegex.exec(url_in);
    if ((linkMatch != null) && (linkMatch.length > 1)) {
      this.url = linkMatch[0];
      this.shortURL = linkMatch[1];
      this.status = "matched";
    } else {
      this.url = url_in;
      this.status = "invalid";
    }
  }

  async initialize() {
    await this.getSID();
    await this.getToyInfo();
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
    // check to make sure that this is a valid link first and that sid is set.
    if (this.hasOwnProperty("sid") && (typeof this.sid === "string")) {
      const res = await fetch("https://api.lovense.com/developer/v2/loading/" + this.sid);
      const json = await res.json();

      // console.log("getToyInfo[" + this.shortURL + "]: " + JSON.stringify(json));
      if (json.result === true) {
        this.toyData = json.data;
        this.status = json.data.status;

        for (const toyId in json.data.toyId.split(',')) {
          this.commandQueue[toyId] = {
            "current": {"v": 0, "p": 0, "r": 0},
            "queue": {"v": 0, "p": 0, "r": 0}
          }
        }
      } else if (json.result === false) {
        this.status = json.data.status;
      }
    } else {
      this.status = "invalid";
    }
  }

  async consumeLink() {
    if (this.status === "queue") {
      const res = await fetch("https://" + controlLinkDomain + "/app/ws2/play/" + this.sid);
      this.status = "controlling";
    }
  }

  async heartbeat() {
    var unixtime = 0;

    if (typeof this.heartbeatUnixTime === "undefined") {
      const offset = new Date().getTimezoneOffset() * 60;  // Return offset to seconds
      this.heartbeatUnixTime = Date.now() + offset;
    } else {
      this.heartbeatUnixTime++;
    }

    const res = await fetch("https://" + controlLinkDomain + "/app/ws/loading/" + this.sid + "?_=" + this.heartbeatUnixTime);

    const json = await res.json();
    console.log("heartbeat: " + JSON.stringify(json));

    return json;
  }


  async sendControlCommand() {
    var payload = {	"cate": "id",
                    "id": {}
                  };

    payload.id = {};

    for (const toyId in this.commandQueue) {
      payload.id[toyId] = this.commandQueue[toyId].queue
    }

    const sessionId = document.getElementById('sessionId').value;
    const url = "https://" + controlLinkDomain + "/app/ws/command/" + sessionId;

    const ret = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: "order=" + JSON.stringify(payload)});

    const data = await ret.json();
    console.log(JSON.stringify(data));

    return data;
  }


  async linkMonitor() {
    const heartbeatData = await this.heartbeat();

    if (heartbeatData.data.status === "unauthorized") {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.status = heartbeatData.data.status;
    return this.status;
  }

  async beginLinkMonitor() {
    this.heartbeatInterval = setInterval(this.linkMonitor, 1000);
  }
};

module.exports = LovenseLink;
