const functions = require("firebase-functions");
const crypto = require("crypto");
const axios = require("axios");

const verifySignature = (originalSignature, body) => {
  let text = JSON.stringify(body);
  text = text.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    (e) => {
      return (
        "\\u" +
        e.charCodeAt(0).toString(16).toUpperCase() +
        "\\u" +
        e.charCodeAt(1).toString(16).toUpperCase()
      );
    }
  );
  const signature = crypto
    .createHmac("SHA256", functions.config().env.channel_secret)
    .update(text)
    .digest("base64")
    .toString();
  if (signature !== originalSignature) {
    functions.logger.error("Unauthorized");
    return false;
  }
  return true;
};

const fetchNaroInfo = async (ncode) => {
  const url = "https://api.syosetu.com/novelapi/api/";
  const params = {
    out: "json",
    ncode: ncode,
  };
  const data = {};
  await axios
    .get(url, { params })
    .then((res) => {
      const info = res.data[1];
      data.lastPosted = info.general_lastup;
      data.latestStory = info.general_all_no;
    })
    .catch((err) => {
      console.error(err);
    });
  return data;
};

module.exports = { verifySignature, fetchNaroInfo };
