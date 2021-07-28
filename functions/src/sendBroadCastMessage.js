const sendBroadCastMessage = async (ncode, apiData) => {
  const naro_url = "https://ncode.syosetu.com";
  await client.broadcast({
    type: "text",
    text: `"${apiData.title}" の最新話が投稿されました！\n\n${naro_url}/${ncode}/${apiData.latestStory}`,
  });
};

module.exports = { sendBroadCastMessage };
