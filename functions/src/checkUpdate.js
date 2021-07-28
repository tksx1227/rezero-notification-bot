const { readDB } = require("./readDB");
const { updateDB } = require("./updateDB");
const { fetchNaroInfo } = require("./fetchNaroInfo");
const { sendBroadCastMessage } = require("./sendBroadCastMessage");

const checkUpdate = async (collection) => {
  const dbData = await readDB(collection.name);
  const apiData = await fetchNaroInfo(collection.ncode);

  if (dbData === undefined || apiData === undefined) {
    await updateDB(collection.name, apiData);
    return;
  }

  const dbTS = Date.parse(dbData.lastPosted);
  const apiTS = Date.parse(apiData.lastPosted);
  if (dbTS < apiTS && dbData.latestStory < apiData.latestStory) {
    sendBroadCastMessage(collection.ncode, apiData);
    updateDB(collection.name, apiData);
  }
};

module.exports = { checkUpdate };
