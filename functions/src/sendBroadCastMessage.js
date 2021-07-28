const { updateDB } = require("./updateDB");

const NARO_URL = "https://ncode.syosetu.com";

const sendBroadCastMessage = async (colName, ncode, apiData) => {
  await client.broadcast({
    type: "text",
    text: `【${apiData.title}】\n最新話が投稿されました！\n\n${NARO_URL}/${ncode}/${apiData.latestStory}`,
  });
  updateDB(colName, apiData);
};

module.exports = { sendBroadCastMessage };
