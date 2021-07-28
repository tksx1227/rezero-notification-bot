const { checkUpdate } = require("./src/checkUpdate");
const { verifySignature } = require("./src/verifySignature");

global.functions = require("firebase-functions");
global.admin = require("firebase-admin");
const line = require("@line/bot-sdk");

global.client = new line.Client({
  channelAccessToken: functions.config().env.channel_access_token,
  channelSecret: functions.config().env.channel_secret,
});

exports.scheduledFunction = functions
  .region("asia-east2")
  .pubsub.schedule("every 30 minutes")
  .onRun(async (_) => {
    const collections = [{ name: "rezero", ncode: "N2267BE" }];
    for (const collection of collections) {
      await checkUpdate(collection);
    }
    return null;
  });

exports.helloWorld = functions
  .region("asia-east2")
  .https.onRequest((_, res) => {
    console.log("Hello from Firebase!");
    res.end();
  });

exports.LineProxy = functions
  .region("asia-east2")
  .https.onRequest(async (req, res) => {
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
