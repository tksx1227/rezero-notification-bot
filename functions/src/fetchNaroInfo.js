const axios = require("axios");

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
      data.title = info.title;
      data.lastPosted = info.general_lastup;
      data.latestStory = info.general_all_no;
    })
    .catch((err) => {
      console.error(err);
    });
  return data;
};

module.exports = { fetchNaroInfo };
