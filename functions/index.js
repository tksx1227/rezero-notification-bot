const { verifySignature, fetchNaroInfo } = require("./utils");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const line = require("@line/bot-sdk");

const ncode = "N2267BE";
const NARO_URL = "https://ncode.syosetu.com";

const client = new line.Client({
  channelAccessToken: functions.config().env.channel_access_token,
  channelSecret: functions.config().env.channel_secret,
});

const updateDB = async (colName, docName, data) => {
  const ref = admin.firestore().collection(colName).doc(docName);
  await ref
    .set({
      lastPosted: data.lastPosted,
      latestStory: data.latestStory,
    })
    .catch((err) => {
      console.error(err);
    });
};

const readDB = async (colName, docName) => {
  const ref = admin.firestore().collection(colName).doc(docName);
  const doc = await ref.get();
  return doc.data();
};

// 30分おきに定期実行する
const updateCheck = async (colName, docName, ncode) => {
  const dbData = await readDB(colName, docName);
  const apiData = await fetchNaroInfo(ncode);

  if (dbData === undefined || apiData === undefined) {
    await updateDB(colName, docName, apiData);
    return;
  }

  const dbTS = Date.parse(dbData.lastPosted);
  const apiTS = Date.parse(apiData.lastPosted);
  // テストのため不等号を使用
  if (dbTS <= apiTS) {
    await client.broadcast({
      type: "text",
      text: `最新話が更新されました！\n\n${NARO_URL}/${ncode}/${apiData.latestStory}`,
    });
    updateDB(colName, docName, apiData);
  }
};

exports.callback = functions.https.onRequest(async (req, res) => {
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
        await updateCheck("rezero", "info", ncode);
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: "hello",
        });
      }
    }
  }
  return res.send(req.method);
});

admin.initializeApp();
