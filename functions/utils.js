const axios = require("axios");

const fetchNarouInfo = async (id) => {
  const url = "https://api.syosetu.com/novelapi/api/";
  const params = {
    out: "json",
    ncode: id,
  };
  const data = { title: "", lastPosted: "" };
  await axios
    .get(url, { params })
    .then((res) => {
      const info = res.data[1];
      data.title = info.title;
      data.lastPosted = info.general_lastup;
    })
    .catch((err) => {
      console.error(err);
    });
  return data;
};

module.exports = { fetchNarouInfo };
