const { verifySignature, fetchNaroInfo, readDB, updateDB } = require("./utils");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const line = require("@line/bot-sdk");

const NARO_URL = "https://ncode.syosetu.com";

const client = new line.Client({
  channelAccessToken: functions.config().env.channel_access_token,
  channelSecret: functions.config().env.channel_secret,
});

// 30分おきに定期実行する
// exports.scheduledFunction = functions.pubsub
//   .schedule("every 1 minutes")
//   .onRun(async (_) => {
//     const collections = [{ name: "rezero", ncode: "N2267BE" }];
//     collections.forEach((collection) => {
//       await checkUpdate(collection);
//     });
//     return null;
//   });

const checkUpdate = async (collection) => {
  const dbData = await readDB(collection.name);
  const apiData = await fetchNaroInfo(collection.ncode);

  if (dbData === undefined || apiData === undefined) {
    await updateDB(colName, apiData);
    return;
  }

  const dbTS = Date.parse(dbData.lastPosted);
  const apiTS = Date.parse(apiData.lastPosted);
  // テストのため不等号を使用
  if (dbTS <= apiTS) {
    sendBroadCastMessage(collection.name, collection.ncode, apiData);
  }
};

const scheduler = async () => {
  const collections = [{ name: "rezero", ncode: "N2267BE" }];
  collections.forEach((collection) => {
    checkUpdate(collection);
  });
};

const sendBroadCastMessage = async (colName, ncode, apiData) => {
  await client.broadcast({
    type: "text",
    text: `【${apiData.title}】\n最新話が投稿されました！\n\n${NARO_URL}/${ncode}/${apiData.latestStory}`,
  });
  updateDB(colName, apiData);
};

exports.LineProxy = functions.https.onRequest(async (req, res) => {
  if (req.method === "POST") {
    if (!verifySignature(req.headers["x-line-signature"], req.body)) {
      return res.status(401).send("Unauthorized");
    }

    const event = req.body.events[0];
    if (event === undefined) {
      return res.end();
    }

    if (event.type === "message") {
      if (event.message.type === "text") {
        await scheduler();
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: event.message.text,
        });
      }
    }
  }
  return res.send(req.method);
});

admin.initializeApp();
